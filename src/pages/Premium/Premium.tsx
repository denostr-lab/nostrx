import { useIntl } from '@cookbook/solid-intl';
import { Component, createEffect, Match, onCleanup, onMount, Switch } from 'solid-js';
import PageCaption from '../../components/PageCaption/PageCaption';
import PageTitle from '../../components/PageTitle/PageTitle';
import Wormhole from '../../components/Wormhole/Wormhole';

import { premium as t } from '../../translations';

import styles from './Premium.module.scss';
import Search from '../../components/Search/Search';
import { useNavigate, useParams } from '@solidjs/router';
import TextInput from '../../components/TextInput/TextInput';
import { createStore } from 'solid-js/store';
import { NostrEOSE, NostrEvent, NostrEventContent, NostrEventType } from '../../types/primal';
import { APP_ID } from '../../App';
import { changePremiumName, checkPremiumName, getPremiumQRCode, getPremiumStatus, startListeningForPremiumPurchase, stopListeningForPremiumPurchase } from '../../lib/premium';
import ButtonPremium from '../../components/Buttons/ButtonPremium';
import PremiumSummary from './PremiumSummary';
import { useAccountContext } from '../../contexts/AccountContext';
import PremiumSubscriptionOptions, { PremiumOption } from './PremiumSubscriptionOptions';
import PremiumProfile from './PremiumProfile';
import PremiumSubscribeModal from './PremiumSubscribeModal';
import PremiumHighlights from './PremiumHighlights';
import { sendProfile } from '../../lib/profile';
import PremiumSuccessModal from './PremiumSuccessModal';
import Loader from '../../components/Loader/Loader';
import PremiumStatusOverview from './PremiumStatusOverview';

export type PremiumStore = {
  name: string,
  rename: string,
  nameAvailable: boolean,
  errorMessage: string,
  subOptions: PremiumOption[],
  selectedSubOption: PremiumOption,
  openSubscribe: boolean,
  openSuccess: boolean,
  lnUrl: string,
  membershipId: string,
  amounts: {
    usd: number,
    sats: number,
  },
  membershipStatus: PremiumStatus,
}

export type PremiumStatus = {
  pubkey?: string,
  tier?: string,
  name?: string,
  rename?: string,
  nostr_address?: string,
  lightning_address?: string,
  primal_vip_profile?: string,
  used_storage?: number,
  expires_on?: number,
};

const availablePremiumOptions: PremiumOption[] = [
  { id: '3-months-premium', price: 'm7', duration: 'm3' },
  { id: '12-months-premium', price: 'm6', duration: 'm12' },
];

const Premium: Component = () => {
  const intl = useIntl();
  const account = useAccountContext();
  const params = useParams();
  const navigate = useNavigate();

  let nameInput: HTMLInputElement | undefined;
  let renameInput: HTMLInputElement | undefined;

  let premiumSocket: WebSocket | undefined;

  const [premiumData, setPremiumData] = createStore<PremiumStore>({
    name: '',
    rename: '',
    nameAvailable: true,
    errorMessage: '',
    subOptions: [ ...availablePremiumOptions ],
    selectedSubOption: { ...availablePremiumOptions[0] },
    openSubscribe: false,
    openSuccess: false,
    lnUrl: '',
    membershipId: '',
    amounts: {
      usd: 0,
      sats: 0,
    },
    membershipStatus: {},
  });

  // const setPremiumStatus = async () => {
  //   const isVerified = await isVerifiedByPrimal(account?.activeUser);

  //   setIsPremium(() => isVerified);
  // }

  const onStartAction = () => {
    navigate('/premium/name');
  };

  const setName = (name: string) => {
    setPremiumData('errorMessage', () => '');
    setPremiumData('name', () => name);
  };

  const updateUserMetadata = () => {
    const user = account?.activeUser;

    if (!user) return;

    const metaUpdate = {
      nip05: `${premiumData.name}@primal.net`,
      lud16: `${`${premiumData.name}@primal.net`}`,
    };

    sendProfile({ ...user, ...metaUpdate }, account.relays, account.relaySettings);
  }

  const checkName = (rename?: boolean) => {
    if (!premiumSocket) return;

    const subid = `name_check_${APP_ID}`;

    if (premiumData.name.length < 3) {
      setPremiumData('errorMessage', () => intl.formatMessage(t.errors.nameTooShort));
      return;
    }

    const unsub = subTo(premiumSocket, subid, (type, _, content) => {
      if (type === 'EVENT') {
        const response: { available: boolean } = JSON.parse(content?.content || '{ "available": false}');

        setPremiumData('nameAvailable', () => response.available );
      }

      if (type === 'EOSE') {
        unsub();

        if (premiumData.nameAvailable) {
          if (rename) {
            changePrimalName();
          }
          else {
            navigate('/premium/subscribe');
          }
        } else {
          setPremiumData('errorMessage', () => intl.formatMessage(t.errors.nameUnavailable));
        }
      }
    });

    checkPremiumName(premiumData.name, subid,  premiumSocket);
  };

  const changePrimalName = () => {
    if (!premiumSocket) return;

    const newName = premiumData.rename;

    const subid = `rename_${APP_ID}`;

    if (newName.length < 3) {
      setPremiumData('errorMessage', () => intl.formatMessage(t.errors.nameTooShort));
      return;
    }

    const unsub = subTo(premiumSocket, subid, (type, _, content) => {
      if (type === 'EVENT') {
        const response: { available: boolean } = JSON.parse(content?.content || '{ "available": false}');

        if (!response.available) {
          unsub();
          setPremiumData('errorMessage', () => intl.formatMessage(t.errors.nameUnavailable));
        }
      }

      if (type === 'NOTICE') {
        unsub();
        setPremiumData('errorMessage', () => intl.formatMessage(t.errors.nameNotChanged));
      }

      if (type === 'EOSE') {
        unsub();
        navigate('/premium');
      }
    });

    changePremiumName(newName, subid, premiumSocket);
  };

  let purchuseMonitorUnsub: () => void = () => {};
  const purchuseSubId = `pay_${APP_ID}`;

  const listenForPayement = () => {
    if (!premiumSocket) return;

    purchuseMonitorUnsub = subTo(premiumSocket, purchuseSubId, (type, _, content) => {
      if (type === 'EVENT') {
        const cont: {
          completed_at: number | null,
        } = JSON.parse(content?.content || '{ "completed_at": null }');

        if (!premiumSocket) return;

        if (cont.completed_at !== null) {
          stopListeningForPremiumPurchase(purchuseSubId, premiumSocket);
          purchuseMonitorUnsub();
          updateUserMetadata();
          setPremiumData('openSubscribe', () => false);
          setPremiumData('openSuccess', () => true);
        }
      }

      if (type === 'EOSE') {
      }
    });

    startListeningForPremiumPurchase(premiumData.membershipId, purchuseSubId, premiumSocket);
  }

  const subscribeToPremium = () => {
    if (!premiumSocket) return;

    const subId = `qr_${APP_ID}`;
    const unsub = subTo(premiumSocket, subId, (type, _, content) => {
      if (type === 'EVENT') {
        const cont: {
          qr_code?: string,
          membership_quote_id?: string,
          amount_usd?: string,
          amount_btc?: string,
        } = JSON.parse(content?.content || '{}');

        const usd = parseFloat(cont.amount_usd || '0');
        const btc = parseFloat(cont.amount_btc || '0');

        setPremiumData('amounts', () => ({
          usd: isNaN(usd) ? 0 : usd,
          sats: isNaN(btc) ? 0 : btc * 100_000_000,
        }));

        setPremiumData('lnUrl', () => cont.qr_code || '');
        setPremiumData('membershipId', () => cont.membership_quote_id || '');
      }

      if (type === 'EOSE') {
        unsub();
        setPremiumData('openSubscribe', () => true);

        listenForPayement()
      }
    });

    getPremiumQRCode(account?.publicKey, premiumData.name, premiumData.selectedSubOption.id, subId, premiumSocket)
  };

  const checkPremiumStatus = () => {
    if (!premiumSocket || premiumSocket.readyState !== WebSocket.OPEN) return;

    const subId = `ps_${APP_ID}`;

    let gotEvent = false;

    const unsub = subTo(premiumSocket, subId, (type, _, content) => {
      if (type === 'EVENT') {
        const status: PremiumStatus = JSON.parse(content?.content || '{}');

        gotEvent = true;
        setPremiumData('membershipStatus', () => ({ ...status }));
        status.name && setPremiumData('name', status.name)
      }

      if (type === 'EOSE') {
        unsub();

        if (!gotEvent) {
          setPremiumData('membershipStatus', () => ({ tier: 'none' }));
        }
      }
    });
    getPremiumStatus(account?.publicKey, subId, premiumSocket)
  };

  const subTo = (socket: WebSocket, subId: string, cb: (type: NostrEventType, subId: string, content?: NostrEventContent) => void ) => {
    const listener = (event: MessageEvent) => {
      const message: NostrEvent | NostrEOSE = JSON.parse(event.data);
      const [type, subscriptionId, content] = message;

      if (subId === subscriptionId) {
        cb(type, subscriptionId, content);
      }

    };

    socket.addEventListener('message', listener);

    return () => {
      socket.removeEventListener('message', listener);
    };
  };

  let keepSoceketOpen = false;

  const openSocket = () => {
    premiumSocket = new WebSocket('wss://wallet.primal.net/v1');

    premiumSocket.addEventListener('close', () => {
      console.log('PREMIUM SOCKET CLOSED');
      if (keepSoceketOpen) {
        openSocket();
      }
    });

    premiumSocket.addEventListener('open', () => {
      console.log('PREMIUM SOCKET OPENED');
      checkPremiumStatus();
    });
  }

  onMount(() => {
    keepSoceketOpen = true;
    openSocket();
  });

  onCleanup(() => {
    keepSoceketOpen = false;
    premiumSocket?.close();
  });

  createEffect(() => {
    if (account?.isKeyLookupDone && account.hasPublicKey()) {
      checkPremiumStatus();
    }
  })

  createEffect(() => {
    if (params.step === 'name') {
      nameInput?.focus();
      setPremiumData('name', () => account?.activeUser?.name || '');
    }
    else if (params.step === 'rename') {
      renameInput?.focus();
      setPremiumData('rename', () => premiumData.name);
    }
  });

  // createEffect(() => {
  //   setPremiumData('name', () => account?.activeUser?.name || '');
  // });

  createEffect(() => {
    if (!params.step) {
      checkPremiumStatus();
    }
  });

  return (
    <div>
      <PageTitle title={
        intl.formatMessage(t.title.general)}
      />

      <Wormhole
        to="search_section"
      >
        <Search />
      </Wormhole>

      <PageCaption title={intl.formatMessage(t.title.general)} />

      <div class={styles.premiumContent}>
        <div class={styles.premiumStepContent}>
          <Switch
            fallback={<Loader />}
          >
            <Match when={params.step === 'name'}>
              <div class={styles.title}>
                {intl.formatMessage(t.title.name)}
              </div>

              <div class={styles.input}>
                <TextInput
                  ref={nameInput}
                  value={premiumData.name}
                  onChange={setName}
                  validationState={premiumData.errorMessage.length > 0 ? 'invalid' : 'valid'}
                  errorMessage={premiumData.errorMessage}
                  type="text"
                  inputClass={styles.centralize}
                  descriptionClass={styles.centralize}
                  errorClass={styles.centralError}
                />
              </div>

              <PremiumSummary name={premiumData.name} />

              <ButtonPremium
                onClick={() => checkName()}
              >
                {intl.formatMessage(t.actions.next)}
              </ButtonPremium>
            </Match>

            <Match when={params.step === 'subscribe'}>
              <div class={styles.congrats}>
                <div>{intl.formatMessage(t.title.subscription)}</div>
                <div>{intl.formatMessage(t.title.subscriptionSubtitle)}</div>
              </div>

              <PremiumProfile profile={account?.activeUser} />

              <PremiumSummary name={premiumData.name} />

              <PremiumSubscriptionOptions
                options={premiumData.subOptions}
                selectedOption={premiumData.selectedSubOption}
                onSelect={(option) => {
                  setPremiumData('selectedSubOption', () => ({ ...option }));
                }}
              />

              <ButtonPremium
                onClick={subscribeToPremium}
              >
                {intl.formatMessage(t.actions.subscribe)}
              </ButtonPremium>
            </Match>

            <Match when={params.step === 'rename'}>
              <div class={styles.title}>
                {intl.formatMessage(t.title.rename)}
              </div>

              <div class={styles.input}>
                <TextInput
                  ref={renameInput}
                  value={premiumData.rename}
                  onChange={setName}
                  validationState={premiumData.errorMessage.length > 0 ? 'invalid' : 'valid'}
                  errorMessage={premiumData.errorMessage}
                  type="text"
                  inputClass={styles.centralize}
                  descriptionClass={styles.centralize}
                  errorClass={styles.centralError}
                />
              </div>

              <PremiumSummary name={premiumData.rename} />

              <ButtonPremium
                onClick={() => checkName(true)}
              >
                {intl.formatMessage(t.actions.rename)}
              </ButtonPremium>
            </Match>

            <Match when={premiumData.membershipStatus?.tier === 'premium'}>
              <PremiumStatusOverview data={premiumData} profile={account?.activeUser} onExtendPremium={subscribeToPremium}/>
            </Match>

            <Match when={premiumData.membershipStatus?.tier === 'none'}>
              <PremiumHighlights onStart={onStartAction} />
            </Match>
          </Switch>


          <PremiumSubscribeModal
            open={premiumData.openSubscribe}
            profile={account?.activeUser}
            onClose={() => {
              setPremiumData('openSubscribe', () => false);

              premiumSocket && stopListeningForPremiumPurchase(purchuseSubId, premiumSocket);
              purchuseMonitorUnsub();

            }}
            onPlanChange={(plan: PremiumOption) => {
              premiumSocket && stopListeningForPremiumPurchase(purchuseSubId, premiumSocket);
              setPremiumData('selectedSubOption', () => ({ ...plan }));
              subscribeToPremium();
            }}
            data={premiumData}
          />

          <PremiumSuccessModal
            open={premiumData.openSuccess}
            profile={account?.activeUser}
            onClose={() => {
              setPremiumData('openSuccess', () => false);
              checkPremiumStatus();
              navigate('/premium');
            }}
            data={premiumData}
          />
        </div>
      </div>
    </div>
  );
}

export default Premium;
