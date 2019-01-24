self.addEventListener('message', (e) => {
    if (!e)
        return;
    
    const {id, file} = e.data;

    try {
        const reader = new FileReaderSync();

        postMessage({
            id,
            url: reader.readAsDataURL(file)
        });
    } catch (err) {
        postMessage({
            id,
            error: err.message
        });
    }
});