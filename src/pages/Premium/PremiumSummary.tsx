import { useIntl } from '@cookbook/solid-intl';
import { Component } from 'solid-js';

import { premium as t } from '../../translations';

import styles from './Premium.module.scss';


const PremiumSummary: Component<{ name: string }> = (props) => {
  const intl = useIntl();

  return (
    <div class={styles.premiumSummary}>
      <div class={styles.summaryItem}>
        <div>Your verified nostr address</div>
        <div>
          <span class={styles.summaryName}>{props.name}</span>
          @primal.net
        </div>
      </div>

      <div class={styles.summaryItem}>
        <div>Your custom lightning address</div>
        <div>
          <span class={styles.summaryName}>{props.name}</span>
          @primal.net
        </div>
      </div>

      <div class={styles.summaryItem}>
        <div>Your VIP profile url on primal.net</div>
        <div>
          primal.net/
          <span class={styles.summaryName}>{props.name}</span>
        </div>
      </div>
    </div>
  );
}

export default PremiumSummary;
