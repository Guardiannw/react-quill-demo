import React, { useState, useEffect } from 'react';
import * as deltaModule from './delta';

export const useDelta = () => {
  const [hotResult, setHotResult] = useState(deltaModule);

  useEffect(() => {
    if (module.hot) {
      module.hot.accept('./delta', () => {
        import('./delta').then((result) => {
          setHotResult(result);
        });
      })
    }
  }, []);

  return hotResult;
}