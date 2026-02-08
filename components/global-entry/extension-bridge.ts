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

export const isExtensionInstalled = (): boolean => {
    return !!document.getElementById('ged-extension-installed');
};

export const waitForExtension = (timeoutMs = 2000): Promise<boolean> => {
    return new Promise((resolve) => {
        if (isExtensionInstalled()) {
            resolve(true);
            return;
        }

        const start = Date.now();
        const check = setInterval(() => {
            if (isExtensionInstalled()) {
                clearInterval(check);
                resolve(true);
            } else if (Date.now() - start > timeoutMs) {
                clearInterval(check);
                resolve(false);
            }
        }, 100);
    });
};
