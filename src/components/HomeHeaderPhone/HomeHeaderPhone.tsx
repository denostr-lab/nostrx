import { Component, onCleanup, onMount, Show } from 'solid-js';
import { A } from '@solidjs/router';
import Avatar from '../Avatar/Avatar';

import styles from './HomeHeaderPhone.module.scss';
import FeedSelect from '../FeedSelect/FeedSelect';
import Branding from '../Branding/Branding';
import { useAccountContext } from '../../contexts/AccountContext';
import { useHomeContext } from '../../contexts/HomeContext';
import { useIntl } from '@cookbook/solid-intl';
import { placeholders as t, actions as tActions } from '../../translations';
import { hookForDev } from '../../lib/devTools';
import ButtonPrimary from '../Buttons/ButtonPrimary';

const HomeHeaderPhone: Component< { id?: string } > = (props) => {

  const account = useAccountContext();
  const home = useHomeContext();
  const intl = useIntl();

  let lastScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  let smallHeader: HTMLDivElement | undefined;
  let border: HTMLDivElement | undefined;

  const onScroll = () => {
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

    home?.actions?.updateScrollTop(scrollTop);

    const isScrollingDown = scrollTop > lastScrollTop;
    lastScrollTop = scrollTop;

    if (scrollTop < 117) {
      if (border) {
        border.style.display = 'none';
      }
      smallHeader?.classList.remove(styles.hiddenSelector);
      smallHeader?.classList.remove(styles.fixedSelector);
      return;
    }

    if (lastScrollTop < 117) {
      smallHeader?.classList.add(styles.instaHide);
      return;
    }

    if (border) {
      border.style.display = 'flex';
    }
    smallHeader?.classList.remove(styles.instaHide);

    if (!isScrollingDown) {
      smallHeader?.classList.add(styles.fixedSelector);
      smallHeader?.classList.remove(styles.hiddenSelector);
      return;
    }

    smallHeader?.classList.add(styles.hiddenSelector);
  }

  onMount(() => {
    window.addEventListener('scroll', onScroll);
  });

  onCleanup(() => {
    window.removeEventListener('scroll', onScroll);
  });

  const activeUser = () => account?.activeUser;

  return (
    <div id={props.id} class={styles.fullHeader} ref={smallHeader}>
      <div class={styles.phoneHeader}>
        <div class={styles.logo}>
          <Branding small={true} />
        </div>
        <Show
          when={account?.hasPublicKey()}
          fallback={
            <Show when={account?.isKeyLookupDone}>
              <div class={styles.welcomeMessageSmall}>
                <ButtonPrimary onClick={account?.actions.showGetStarted}>
                  {intl.formatMessage(tActions.getStarted)}
                </ButtonPrimary>
              </div>
            </Show>
          }
        >
          <div class={styles.userProfile}>
            <A href="/profile" class={styles.avatar}>
              <Avatar
                size="vvs"
                user={activeUser()}
                showCheck={false}
              />
            </A>
          </div>
        </Show>
        <Show when={home?.selectedFeed}>
          <FeedSelect isPhone={true} />
        </Show>
      </div>
      <div
        ref={border}
        class={styles.smallHeaderBottomBorder}
      >
        <div class={styles.leftCorner}></div>
        <div class={styles.rightCorner}></div>
      </div>
    </div>
  );
}

export default hookForDev(HomeHeaderPhone);
