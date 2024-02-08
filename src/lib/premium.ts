import { Kind } from "../constants";
import { signEvent } from "./nostrAPI";

export const checkPremiumName = (name: string, subId: string, socket: WebSocket) => {
  const message = JSON.stringify([
    "REQ",
    subId,
    {cache: ["membership_name_available", { name  }]},
  ]);

  if (socket) {
    const e = new CustomEvent('send', { detail: { message, ws: socket }});

    socket.send(message);
    socket.dispatchEvent(e);
  } else {
    throw('no_socket');
  }
}

export const changePremiumName = async (name: string, subId: string, socket: WebSocket) => {

  const event = {
    kind: Kind.Settings,
    tags: [],
    created_at: Math.floor((new Date()).getTime() / 1000),
    content: JSON.stringify({
      name,
    }),
  };

  try {
    const signedNote = await signEvent(event);

    const message = JSON.stringify([
      "REQ",
      subId,
      {cache: ["membership_change_name", { event_from_user: signedNote  }]},
    ]);

    if (socket) {
      const e = new CustomEvent('send', { detail: { message, ws: socket }});

      socket.send(message);
      socket.dispatchEvent(e);
    } else {
      throw('no_socket');
    }

    return true;
  } catch (reason) {
    console.error('Failed to upload: ', reason);
    return false;
  }
}

export const getPremiumQRCode = async (pubkey: string | undefined, name: string, productId: string, subId: string, socket: WebSocket) => {
  if (!pubkey) return;

  const event = {
    kind: Kind.Settings,
    tags: [['p', pubkey]],
    created_at: Math.floor((new Date()).getTime() / 1000),
    content: JSON.stringify({
      name,
      product_id: productId,
      receiver_pubkey: pubkey,
    }),
  };

  try {
    const signedNote = await signEvent(event);

    const message = JSON.stringify([
      "REQ",
      subId,
      {cache: ["membership_purchase_product", { event_from_user: signedNote }]},
    ]);

    if (socket) {
      const e = new CustomEvent('send', { detail: { message, ws: socket }});

      socket.send(message);
      socket.dispatchEvent(e);
    } else {
      throw('no_socket');
    }


    return true;
  } catch (reason) {
    console.error('Failed to upload: ', reason);
    return false;
  }
}

export const startListeningForPremiumPurchase = (membershipId: string, subId: string, socket: WebSocket) => {
  const message = JSON.stringify([
    "REQ",
    subId,
    {cache: ["membership_purchase_monitor", { membership_quote_id: membershipId }]},
  ]);

  if (socket) {
    const e = new CustomEvent('send', { detail: { message, ws: socket }});

    socket.send(message);
    socket.dispatchEvent(e);
  } else {
    throw('no_socket');
  }
};

export const stopListeningForPremiumPurchase = (subId: string, socket: WebSocket) => {
  const message = JSON.stringify([
    "CLOSE",
    subId,
  ]);

  if (socket) {
    const e = new CustomEvent('send', { detail: { message, ws: socket }});

    socket.send(message);
    socket.dispatchEvent(e);
  } else {
    throw('no_socket');
  }
};


export const getPremiumStatus = async (pubkey: string | undefined, subId: string, socket: WebSocket) => {
  if (!pubkey) return;

  const event = {
    kind: Kind.Settings,
    tags: [['p', pubkey]],
    created_at: Math.floor((new Date()).getTime() / 1000),
    content: JSON.stringify({}),
  };

  try {
    const signedNote = await signEvent(event);

    const message = JSON.stringify([
      "REQ",
      subId,
      {cache: ["membership_status", { event_from_user: signedNote }]},
    ]);

    if (socket) {
      const e = new CustomEvent('send', { detail: { message, ws: socket }});

      socket.send(message);
      socket.dispatchEvent(e);
    } else {
      throw('no_socket');
    }


    return true;
  } catch (reason) {
    console.error('Failed to upload: ', reason);
    return false;
  }
}
