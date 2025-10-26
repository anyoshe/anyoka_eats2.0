// import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import config from '../../config';
// import { AuthContext } from '../../contexts/AuthContext';
// import Invoice from './Invoice.Modal';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import styles from './OrderSummaryPage.module.css';

// const OrderSummaryPage = () => {
//   const { orderId } = useParams();
//   const { token } = useContext(AuthContext);
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const invoiceRef = useRef();

//   // Fetch order
//   useEffect(() => {
//     const fetchOrder = async () => {
//       if (!token) {
//         setLoading(false);
//         setError('User not authenticated');
//         return;
//       }

//       try {
//         const res = await fetch(`${config.backendUrl}/api/orders/${orderId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const text = await res.text();
//         let data;
//         try {
//           data = JSON.parse(text);
//         } catch {
//           throw new Error(text);
//         }

//         if (!res.ok) throw new Error(data.error || 'Failed to fetch order');
//         setOrder(data);
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrder();
//   }, [orderId, token]);

//   // Compute invoice data
//   const invoiceData = useMemo(() => {
//     if (!order) return null;

//     const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
//     const vat = subtotal * 0.16;
//     const total = subtotal + (order.delivery?.fee || 0);
//     const paid = order.paymentType === 'delivery'
//       ? order.delivery?.fee
//       : order.paymentType === 'goods'
//       ? subtotal
//       : total;
//     const balance = total - paid;

//     // Invoice title logic
//     let heading = 'Invoice';
//     if (order.paymentMethod === 'COD') heading = 'Invoice (Cash on Delivery)';
//     if (order.paymentStatus === 'Paid') heading = 'Cash Sale';
//     if (order.paymentStatus === 'Partial') heading = 'Part Payment Invoice';

//     return {
//       heading,
//       date: new Date(order.createdAt).toLocaleString(),
//       invoiceNumber: order.orderId,
//       description: `${order.delivery?.option === 'own' ? 'Pickup Order' : 'Delivery Order'} | ${order.paymentMethod}`,
//       items: order.items.map((item) => ({
//         description: item.product?.name || 'Item',
//         quantity: item.quantity,
//         price: item.price,
//         total: item.price * item.quantity,
//       })),
//       subtotal,
//       vat,
//       total,
//       paid,
//       balance,
//       customer: order.user,
//       delivery: order.delivery,
//     };
//   }, [order]);

//   // Generate PDF from invoice
//   const handleDownloadPDF = async () => {
//     const element = invoiceRef.current;
//     const canvas = await html2canvas(element, { scale: 2 });
//     const imgData = canvas.toDataURL('image/png');
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const imgProps = pdf.getImageProperties(imgData);
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//     pdf.save(`${invoiceData.invoiceNumber}.pdf`);
//   };

//   // Share invoice (works on mobile browsers)
//   const handleShare = async () => {
//     if (!navigator.share) {
//       alert('Sharing is not supported on this device.');
//       return;
//     }

//     const pdfFileName = `${invoiceData.invoiceNumber}.pdf`;
//     const element = invoiceRef.current;
//     const canvas = await html2canvas(element, { scale: 2 });
//     const blob = await (await fetch(canvas.toDataURL('image/png'))).blob();
//     const file = new File([blob], pdfFileName, { type: 'application/pdf' });

//     try {
//       await navigator.share({
//         title: 'Anyoka Eats Invoice',
//         text: 'Here is your Anyoka Eats invoice',
//         files: [file],
//       });
//     } catch (err) {
//       console.error('Share failed:', err);
//     }
//   };

//   if (loading) return <p>Loading order...</p>;
//   if (error) return <p style={{ color: 'red' }}>{error}</p>;
//   if (!order || !invoiceData) return <p>Order not found.</p>;

//   return (
//     <div className={styles.invoicePage}>
//       <div ref={invoiceRef} className={styles.invoiceWrapper}>
//         <h1 className={styles.invoiceHeading}>{invoiceData.heading}</h1>

//         <Invoice
//           date={invoiceData.date}
//           invoiceNumber={invoiceData.invoiceNumber}
//           description={invoiceData.description}
//           items={invoiceData.items}
//           vat={invoiceData.vat}
//           subtotal={invoiceData.subtotal}
//           total={invoiceData.total}
//         />

//         <div className={styles.summaryExtras}>
//           <p><strong>Paid:</strong> KES {invoiceData.paid.toLocaleString()}</p>
//           <p><strong>Balance Due:</strong> KES {invoiceData.balance.toLocaleString()}</p>
//           <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
//           <p><strong>Delivery Option:</strong> {order.delivery?.option}</p>
//           <p><strong>Delivery Location:</strong> {order.delivery?.location}</p>
//         </div>
//       </div>

//       <div className={styles.invoiceActions}>
//         <button onClick={handleDownloadPDF} className={styles.actionBtn}>
//           📄 Download PDF
//         </button>

//         <button onClick={handleShare} className={styles.actionBtn}>
//           📤 Share Invoice
//         </button>

//         <Link to="/" className={styles.backLink}>← Back to Home</Link>
//       </div>
//     </div>
//   );
// };

// export default OrderSummaryPage;

import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import config from '../../config';
import { AuthContext } from '../../contexts/AuthContext';
import Invoice from './Invoice.Modal';
import styles from './OrderSummaryPage.module.css';

const OrderSummaryPage = () => {
  const { orderId } = useParams();
  const { token } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${config.backendUrl}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch order');
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, token]);

  const invoiceData = useMemo(() => {
    if (!order) return null;

    const subtotal = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const vat = subtotal * 0.16;
    const total = subtotal + (order.delivery?.fee || 0);

    const paid = order.paymentType === 'delivery'
      ? order.delivery?.fee
      : order.paymentType === 'goods'
      ? subtotal
      : total;

    const balance = total - paid;

    return {
      date: new Date(order.createdAt).toLocaleDateString(),
      invoiceNumber: order.orderId,
      description: `${order.delivery?.option === 'own' ? 'Pickup Order' : 'Delivery Order'} | ${order.paymentMethod}`,
      items: order.items.map((item) => ({
        description: item.product?.name || 'Item',
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      vat,
      subtotal,
      total,
      paid,
      balance,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      delivery: order.delivery,
      customer: order.user,
    };
  }, [order]);

  if (loading) return <p>Loading order...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!invoiceData) return <p>Order not found.</p>;

  return (
    <div className={styles.invoicePage}>
      <Invoice {...invoiceData} />
      <div className={styles.navigation}>
        <Link to="/" className={styles.backLink}>← Back to Home</Link>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
