import React from 'react';
import Button from '../../ui/Button';
import { useVoiceCommandContext } from '../../../context/VoiceCommandContext';

const MockPollingTester = () => {
  const {
    startPolling,
    cancelPolling,
    isPolling,
    pollingAttempts,
    commandId,
    reportData,
    state,
    error,
    lastPollingMessage
  } = useVoiceCommandContext();

  const startQuickMock = () => {
    // Usa un id MOCK_ para activar el mock interno
    startPolling('MOCK_QUICK');
  };

  const startAnotherMock = () => {
    startPolling('MOCK_ANOTHER');
  };

  return (
    <div className="ml-3 flex items-center space-x-2">
      <div className="text-xs text-gray-500">Dev Mock:</div>
      <Button onClick={startQuickMock} className="px-2 py-1 text-sm">Simular PROCESSING → ÉXITO</Button>
      <Button onClick={startAnotherMock} variant="outline" className="px-2 py-1 text-sm">Simular otro</Button>
      <Button onClick={cancelPolling} variant="ghost" className="px-2 py-1 text-sm">Cancelar</Button>
      <div className="text-xs text-gray-400 ml-2">
        {isPolling ? `Polling (${pollingAttempts})` : 'No polling'}
      </div>
      <div className="ml-3 text-xs text-gray-600 max-w-xs truncate">
        {lastPollingMessage || '-'}
      </div>
    </div>
  );
};

export default MockPollingTester;
