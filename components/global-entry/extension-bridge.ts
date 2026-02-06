export type ExtensionMessage =
    | { type: 'WEB_START'; payload: any }
    | { type: 'WEB_STOP' }
    | { type: 'REQ_STATUS' }
    | { type: 'BOOK_APPT'; payload: any };

export const sendExtensionMessage = (type: ExtensionMessage['type'], payload?: any) => {
    window.postMessage(
        {
            source: 'ged-web',
            type,
            payload,
        },
        '*'
    );
};
