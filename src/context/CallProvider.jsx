'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MyContext } from './MyProvider';
import IncomingCallModal from '@/app/[locale]/components/call/IncomingCallModal';
import CallScreen from '@/app/[locale]/components/call/CallScreen';

export const CallContext = createContext({});

export function CallProvider({ children }) {
  const { apiPost, getStoredUser, getStoredToken } = useContext(MyContext);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const activeCallRef = useRef(null);
  activeCallRef.current = activeCall;

  useEffect(() => {
    const poll = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      const me = getStoredUser();
      if (!me || !getStoredToken() || activeCallRef.current) return;
      try {
        const result = await apiPost('call_pending.php', { uid: me.id });
        if (result.Result === 'true' && result.data) {
          setIncomingCall(result.data);
        }
      } catch {
        // silent — polling retries on next tick
      }
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [apiPost, getStoredUser, getStoredToken]);

  const startCall = useCallback(async (receiverId, receiverName, type) => {
    const me = getStoredUser();
    if (!me) return;
    try {
      const result = await apiPost('call_initiate.php', {
        caller_id: me.id, receiver_id: receiverId, type,
      });
      if (result.Result === 'true') {
        setActiveCall({
          callId: result.data.call_id,
          channelName: result.data.channel_name,
          type: result.data.type,
          sdkAppId: result.data.sdk_app_id,
          userSig: result.data.user_sig,
          configured: result.data.configured,
          isCaller: true,
          peerName: receiverName,
          status: 'calling',
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [apiPost, getStoredUser]);

  const acceptCall = useCallback(async () => {
    const me = getStoredUser();
    if (!me || !incomingCall) return;
    try {
      const result = await apiPost('call_respond.php', {
        call_id: incomingCall.id, uid: me.id, action: 'ACCEPT',
      });
      if (result.Result === 'true') {
        setActiveCall({
          callId: result.data.call_id,
          channelName: result.data.channel_name,
          type: result.data.type,
          sdkAppId: result.data.sdk_app_id,
          userSig: result.data.user_sig,
          configured: result.data.configured,
          isCaller: false,
          peerName: incomingCall.caller?.name,
          status: 'connected',
        });
        setIncomingCall(null);
      }
    } catch (error) {
      console.error(error);
    }
  }, [apiPost, getStoredUser, incomingCall]);

  const rejectCall = useCallback(async () => {
    const me = getStoredUser();
    if (!incomingCall) return;
    try {
      await apiPost('call_respond.php', { call_id: incomingCall.id, uid: me?.id, action: 'REJECT' });
    } catch (error) {
      console.error(error);
    }
    setIncomingCall(null);
  }, [apiPost, getStoredUser, incomingCall]);

  const endCall = useCallback(async () => {
    const current = activeCallRef.current;
    setActiveCall(null);
    if (current) {
      try {
        await apiPost('call_end.php', { call_id: current.callId });
      } catch (error) {
        console.error(error);
      }
    }
  }, [apiPost]);

  useEffect(() => {
    if (!activeCall || !activeCall.isCaller || activeCall.status !== 'calling') return;
    const interval = setInterval(async () => {
      try {
        const result = await apiPost('call_status.php', { call_id: activeCall.callId });
        if (result.Result === 'true') {
          if (result.data.status === 'ACCEPTED') {
            setActiveCall((c) => (c ? { ...c, status: 'connected' } : c));
          } else if (['REJECTED', 'ENDED', 'MISSED'].includes(result.data.status)) {
            setActiveCall(null);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeCall, apiPost]);

  return (
    <CallContext.Provider value={{ startCall }}>
      {children}
      {incomingCall && !activeCall ? (
        <IncomingCallModal call={incomingCall} onAccept={acceptCall} onReject={rejectCall} />
      ) : null}
      {activeCall ? <CallScreen call={activeCall} onEnd={endCall} /> : null}
    </CallContext.Provider>
  );
}

export function useCall() {
  return useContext(CallContext);
}
