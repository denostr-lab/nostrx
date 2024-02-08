import { useIntl } from '@cookbook/solid-intl';
import { Component } from 'solid-js';
import ButtonPremium from '../../components/Buttons/ButtonPremium';

import { premium as t } from '../../translations';

import styles from './Premium.module.scss';


const PremiumHighlights: Component<{ onStart: () => void }> = (props) => {
  const intl = useIntl();

  return (
    <div class={styles.premiumHighlights}>
      <div class={styles.premiumHighlightInfo}>
        <div class={styles.leftSide}>
          <div class={styles.orangeCheckBig}></div>
          <div class={styles.pricingSummary}>
            <div>
              <div class={styles.price}>$7/month</div>
              <div class={styles.duration}>3 months</div>
            </div>
            <div class={styles.or}>or</div>
            <div>
              <div class={styles.price}>$6/month</div>
              <div class={styles.duration}>12 months</div>
            </div>
          </div>
        </div>

        <div class={styles.rightSide}>
          <div class={styles.perk}>
            <div class={styles.perkTitle}>
              Primal Orange Check
            </div>
            <ul class={styles.perkItems}>
              <li>Verified nostr address</li>
              <li>Bitcoin lightning address</li>
              <li>VIP profile on primal.net</li>
            </ul>
          </div>
          <div class={styles.perk}>
            <div class={styles.perkTitle}>
              Nostr Power Tools
            </div>
            <ul class={styles.perkItems}>
              <li>Good stuff</li>
              <li>Better stuff</li>
              <li>Cool stuff</li>
              <li>Super cool stuff</li>
            </ul>
          </div>
        </div>
      </div>

      <ButtonPremium
        onClick={props.onStart}
      >
        {intl.formatMessage(t.actions.start)}
      </ButtonPremium>
    </div>
  );
}

export default PremiumHighlights;
