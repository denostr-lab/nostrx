import { Component, createEffect, Show } from 'solid-js';
import Avatar from '../../components/Avatar/Avatar';
import ButtonCopy from '../../components/Buttons/ButtonCopy';
import Modal from '../../components/Modal/Modal';
import QrCode from '../../components/QrCode/QrCode';
import TransactionAmount from '../../components/TransactionAmount/TransactionAmount';
import { authorName, nip05Verification, userName } from '../../stores/profile';
import { account } from '../../translations';

import { PrimalUser } from '../../types/primal';
import { PremiumStore } from './Premium';

import styles from './Premium.module.scss';
import PremiumSubscriptionOptions, { PremiumOption } from './PremiumSubscriptionOptions';


const PremiumSubscribeModal: Component<{
  profile?: PrimalUser,
  open?: boolean,
  onClose: () => void,
  onPlanChange: (plan: PremiumOption) => void,
  data: PremiumStore,
}> = (props) => {

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
    >
      <div class={styles.subscribeModal}>

        <div class={styles.header}>

          <div class={styles.userInfo}>
            <div class={styles.avatar}>
              <Avatar
                size="sm"
                user={props.profile}
              />
            </div>
            <div class={styles.details}>
              <div class={styles.name}>
                {authorName(props.profile)}
                <div class={`${styles.orangeCheck} ${styles.small}`}></div>
              </div>
              <div class={styles.verification} title={props.profile?.nip05}>
                <Show when={props.profile?.nip05}>
                  <span
                    class={styles.verifiedBy}
                    title={props.profile?.nip05}
                  >
                    {nip05Verification(props.profile)}
                  </span>
                </Show>
              </div>
            </div>
          </div>
          <button class={styles.close} onClick={props.onClose}>
          </button>
        </div>

        <div>
          <QrCode data={props.data.lnUrl || ''} />
        </div>

        <div class={styles.copyButton}>
          <ButtonCopy
            color="red"
            copyValue={props.data.lnUrl || ''}
            labelBeforeIcon={true}
            label={"Copy invoice"}
          />
        </div>

        <div class={styles.pricePlan}>
          <TransactionAmount
            amountUSD={props.data.amounts.usd}
            amountSats={props.data.amounts.sats}
          />
        </div>

        <PremiumSubscriptionOptions
          options={props.data.subOptions}
          selectedOption={props.data.selectedSubOption}
          onSelect={props.onPlanChange}
          dark={true}
        />
      </div>
    </Modal>
  );
}

export default PremiumSubscribeModal
