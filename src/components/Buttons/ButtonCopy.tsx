import { Component, createSignal, JSXElement, Match, Show, Switch } from 'solid-js';
import { hookForDev } from '../../lib/devTools';
import { Button } from "@kobalte/core";

import styles from './Buttons.module.scss';

const ButtonCopy: Component<{
  id?: string,
  copyValue: string,
  disabled?: boolean,
  label?: string,
  labelBeforeIcon?: boolean,
  color?: 'light' | 'dark' | 'red',
}> = (props) => {

  const [copying, setCopying] = createSignal(false);

  const doCopy = () => {
    navigator.clipboard.writeText(props.copyValue);
    setCopying(true);

    setTimeout(() => setCopying(false), 2_000);
  }

  const colorClass = () => {
    const classes = {
      light: styles.light,
      dark: styles.dark,
      red: styles.red,
    };

    return props.color ? classes[props.color] : styles.dark
  }

  return (
    <Button.Root
      id={props.id}
      class={`${styles.copy} ${colorClass()}`}
      onClick={doCopy}
      disabled={props.disabled}
    >
      <Show when={props.labelBeforeIcon}>
        <div>{props.label}</div>
      </Show>

      <Show
        when={copying()}
        fallback={<div class={`${styles.copyIcon} ${props.labelBeforeIcon ? styles.right : styles.left}`}></div>}
      >
        <div class={`${styles.checkIcon} ${props.labelBeforeIcon ? styles.right : styles.left}`}></div>
      </Show>

      <Show when={!props.labelBeforeIcon}>
        <div>{props.label}</div>
      </Show>
    </Button.Root>
  )
}

export default hookForDev(ButtonCopy);
