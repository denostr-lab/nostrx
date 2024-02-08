import { useIntl } from '@cookbook/solid-intl';
import { useNavigate } from '@solidjs/router';
import { Component } from 'solid-js';
import { unwrap } from 'solid-js/store';
import Avatar from '../../components/Avatar/Avatar';
import ButtonLink from '../../components/Buttons/ButtonLink';
import ButtonPremium from '../../components/Buttons/ButtonPremium';
import { useAccountContext } from '../../contexts/AccountContext';
import { shortDate } from '../../lib/dates';
import { userName } from '../../stores/profile';

import { premium as t } from '../../translations';
import { PrimalUser } from '../../types/primal';
import { formatStorage } from '../../utils';
import { PremiumStore } from './Premium';

import styles from './Premium.module.scss';


const PremiumStatusOverview: Component<{
  data: PremiumStore,
  profile?: PrimalUser,
  onExtendPremium?: () => void,
}> = (props) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const status = () => props.data.membershipStatus;

  return (
    <div class={styles.premiumStatusOverview}>

      <div class={styles.userInfo}>
        <Avatar user={props.profile} size="xl" />
        <div class={styles.userName}>
          {userName(props.profile)}
          <div class={styles.orangeCheck}></div>
        </div>
      </div>

      <div class={styles.membershipDetails}>
        <div class={styles.line}>
          <div class={styles.label}>Nostr Address</div>
          <div class={styles.value}>{status().nostr_address || ''}</div>
        </div>

        <div class={styles.line}>
          <div class={styles.label}>Lightning Address</div>
          <div class={styles.value}>{status().lightning_address || ''}</div>
        </div>

        <div class={styles.line}>
          <div class={styles.label}>Primal VIP Profile</div>
          <div class={styles.value}>{status().primal_vip_profile || ''}</div>
        </div>

        <div class={styles.line}>
          <div class={styles.label}>Used Storage</div>
          <div class={styles.value}>{formatStorage(status().used_storage || 0)} of 100GB</div>
        </div>

        <div class={styles.line}>
          <div class={styles.label}>Expires on</div>
          <div class={styles.value}>{shortDate(status().expires_on || 0)}</div>
        </div>
      </div>

      <div class={styles.changeName}>
        <ButtonLink onClick={() => navigate('/premium/rename')}>
          {intl.formatMessage(t.actions.changeName)}
        </ButtonLink>
      </div>

      <div class={styles.extendPlan}>
        <ButtonPremium onClick={props.onExtendPremium}>
          {intl.formatMessage(t.actions.extendPlan)}
        </ButtonPremium>
      </div>
    </div>
  );
}

export default PremiumStatusOverview;
