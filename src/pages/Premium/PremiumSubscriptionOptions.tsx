import { useIntl } from '@cookbook/solid-intl';
import { Component, For } from 'solid-js';
import ButtonFlip from '../../components/Buttons/ButtonFlip';

import { premium as t } from '../../translations';

import styles from './Premium.module.scss';

export type PremiumOption = {
  id: string,
  price: 'm7' | 'm6',
  duration: 'm3' | 'm12',
};

const PremiumSubscriptionOptions: Component<{
  options: PremiumOption[],
  selectedOption: PremiumOption,
  onSelect: (option: PremiumOption) => void,
  dark?: boolean,
}> = (props) => {
  const intl = useIntl();

  return (
    <div class={styles.subOptions}>
      <For each={props.options}>
        {option =>
          <ButtonFlip
            when={props.selectedOption.id !== option.id}
            onClick={() => props.onSelect(option)}
            dark={props.dark}
          >
            <div class={styles.selectedOption}>
              <div class={styles.price}>
                {intl.formatMessage(t.subOptions.prices[option.price])}
              </div>

              <div class={`${styles.duration} ${props.selectedOption.id !== option.id ? styles.hot : ''}`}>
              {intl.formatMessage(t.subOptions.durations[option.duration])}
              </div>
            </div>
          </ButtonFlip>
        }
      </For>
    </div>
  );
}

export default PremiumSubscriptionOptions;
