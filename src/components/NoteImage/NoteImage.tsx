import { Component, JSX, onCleanup, onMount } from "solid-js";
import styles from "./NoteImage.module.scss";
import mediumZoom from "medium-zoom";
import type { Zoom } from 'medium-zoom';
// @ts-ignore Bad types in nostr-tools
import { generatePrivateKey } from "nostr-tools";

const NoteImage: Component<{
  src?: string,
  isDev?: boolean,
  onError?: JSX.EventHandlerUnion<HTMLImageElement, Event>,
}> = (props) => {
  const imgId = generatePrivateKey();

  const imgRef = () => {
    return document.getElementById(imgId)
  };

  let zoomRef: Zoom | undefined;

  const klass = () => `${styles.noteImage} ${props.isDev ? 'redBorder' : ''}`;

  const doZoom = (e: MouseEvent) => {
    if (!e.target || (e.target as HTMLImageElement).id !== imgId) {
      return;
    }

    zoomRef?.open();
  };

  const getZoom = () => {
    const iRef = imgRef();
    if (zoomRef || !iRef) {
      return zoomRef;
    }

   zoomRef = mediumZoom(iRef, {
        background: "var(--background-site)",
    });

    zoomRef.attach(iRef);
  }

  onMount(() => {
    getZoom();
    document.addEventListener('click', doZoom)
  });

  onCleanup(() => {
    const iRef = imgRef();
    iRef && zoomRef && zoomRef.detach(iRef);
    document.removeEventListener('click', doZoom)
  });

  return <img id={imgId} src={props.src} class={klass()} onerror={props.onError} />;
}

export default NoteImage;
