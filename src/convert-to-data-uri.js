import uuid from 'uuid/v4';

const worker = new Worker('./uri-worker.worker.js');

export const convertFileToDataURI = (file) => new Promise((resolve, reject) => {
    const runId = uuid();

    function handler (ev) {
        const {id, error, url} = ev.data;

        if (id !== runId)
            return;

        if (error)
            reject(error);
        else
            resolve(url);
        
        worker.removeEventListener('message', handler);
    }

    worker.addEventListener('message', handler);

    worker.postMessage({
        id: runId,
        file
    });
});