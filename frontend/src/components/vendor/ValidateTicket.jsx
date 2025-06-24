import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../../styles/ValidateTicket.css';

const ValidateTicket = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);
  const scannerRef = useRef(null); // store instance safely

  const fetchTicket = (id) => {
    const token = localStorage.getItem("token");
    fetch(`http://127.0.0.1:5000/api/vendor/validate-ticket/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setStatus(data.valid);
        setDetails(data);
        setLoading(false);
      })
      .catch(() => {
        setStatus(false);
        setDetails({ message: "Validation failed" });
        setLoading(false);
      });
  };

  useEffect(() => {
    if (ticketId === 'scanner' && qrRef.current && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          console.log("✅ Scanned:", decodedText);
          const id = decodedText.replace(/^TICKET:/, '');
          scannerRef.current.clear().then(() => {
            scannerRef.current = null;
            navigate(`/vendor/validate/${id}`);
          });
        },
        (err) => console.warn("📛 Scan error", err)
      );
    }

    if (ticketId !== "scanner") {
      fetchTicket(ticketId);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [ticketId]);

  return (
    <div className="validate-ticket-wrapper">
  {ticketId === "scanner" && (
    <>
      <h2>📷 Scan Ticket QR</h2>
      <div id="qr-reader" ref={qrRef}></div>
    </>
  )}

  {ticketId !== "scanner" && !loading && (
    <div className={`status-box ${status ? 'valid' : 'invalid'}`}>
      {status ? (
        <>
          <h2>✅ VALID TICKET</h2>
          <p><strong>Event:</strong> {details.event}</p>
          <p><strong>User:</strong> {details.user_name}</p>
          <p><strong>Email:</strong> {details.user_email}</p>
          <p><strong>Booked At:</strong> {new Date(details.booked_at).toLocaleString()}</p>
          {details.already_checked_in && (
            <p className="checked-in-warning">⚠ Already Checked-in</p>
          )}
        </>
      ) : (
        <>
          <h2>❌ INVALID TICKET</h2>
          <p>{details.message}</p>
        </>
      )}
    </div>
  )}
</div>
  );
};

export default ValidateTicket;
