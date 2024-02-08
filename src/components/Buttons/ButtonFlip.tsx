import { Component, JSXElement, Match, Show, Switch } from 'solid-js';
import { hookForDev } from '../../lib/devTools';
import { Button } from "@kobalte/core";

import styles from './Buttons.module.scss';

const ButtonFollow: Component<{
  id?: string,
  onClick?: (e: MouseEvent) => void,
  when?: boolean,
  children?: JSXElement,
  fallback?: JSXElement,
  disabled?: boolean,
  type?: 'button' | 'submit' | 'reset' | undefined,
  dark?: boolean,
}> = (props) => {
  const klass = () => {
    let k = props.when ? styles.flipActive : styles.flipInactive;

    k += props.dark ? ` ${styles.dark}` : '';

    return k;
  }

  const fallback = () => props.fallback || props.children

  return (
    <Button.Root
      id={props.id}
      class={klass()}
      onClick={props.onClick}
      disabled={props.disabled}
      type={props.type}
    >
      <span>
        <Show
          when={props.when}
          fallback={fallback()}
        >
          {props.children}
        </Show>
      </span>
    </Button.Root>
  )
}

export default hookForDev(ButtonFollow);
