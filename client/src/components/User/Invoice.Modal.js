// import React, { useRef } from "react";
// import styles from "./Invoice.module.css";

// export default function Invoice({
//   date,
//   invoiceNumber,
//   description,
//   items,
//   vat,
//   subtotal,
//   total,
// }) {
//   const invoiceRef = useRef();

//   const handlePrint = () => {
//     const printContent = invoiceRef.current;
//     const WinPrint = window.open("", "", "width=900,height=650");
//     WinPrint.document.write("<html><head><title>Invoice</title>");
//     WinPrint.document.write(
//       `<style>${document.querySelector("style")?.innerHTML || ""}</style>`
//     );
//     WinPrint.document.write("</head><body>");
//     WinPrint.document.write(printContent.outerHTML);
//     WinPrint.document.write("</body></html>");
//     WinPrint.document.close();
//     WinPrint.focus();
//     WinPrint.print();
//     WinPrint.close();
//   };

//   return (
//     <div className={styles.wrapper} ref={invoiceRef}>
//       <div className={styles.header}>
//         <div className={styles.headerLeft}>
//           <h1 className={styles.title}>Invoice</h1>
//           <p className={styles.date}>{date}</p>
//         </div>
//         <div className={styles.headerRight}>
//           <p className={styles.invoiceNumber}>INV : {invoiceNumber}</p>
//         </div>
//       </div>

//       <div className={styles.descriptionBox}>
//         <p>{description}</p>
//       </div>

//       <table className={styles.table}>
//         <thead>
//           <tr>
//             <th>Description</th>
//             <th>Quantity</th>
//             <th>Price (Ksh)</th>
//             <th>Total (Ksh)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((item, i) => (
//             <tr key={i}>
//               <td>{item.description}</td>
//               <td>{item.quantity}</td>
//               <td>{item.price.toLocaleString()}</td>
//               <td>{item.total.toLocaleString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div className={styles.summary}>
//         <div>VAT (16%) : <strong>{vat.toLocaleString()}</strong></div>
//         <div>Subtotal : <strong>{subtotal.toLocaleString()}</strong></div>
//         <div>Total : <strong>{total.toLocaleString()}</strong></div>
//       </div>

//       <div className={styles.footer}>
//         <p>anyokaeats@gmail.com</p>
//         <p>+254 706 251 573</p>
//         <p>www.anyokaeats.com</p>
//       </div>

//       <div className={styles.printBtnContainer}>
//         <button onClick={handlePrint} className={styles.printBtn}>
//           Download / Print Invoice
//         </button>
//       </div>
//     </div>
//   );
// }



import React, { useRef, useMemo } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import styles from "./Invoice.module.css";

export default function Invoice({
  date,
  invoiceNumber,
  description,
  items,
  vat,
  subtotal,
  total,
  paymentStatus,
  paymentMethod,
  paymentType,
  delivery,
  customer,
}) {
  const invoiceRef = useRef();

  // 🧠 Dynamic heading and payment calculations
  const { heading, paid, balance } = useMemo(() => {
    let heading = "Invoice";
    let paid = 0;
    let balance = total;

    if (paymentMethod === "COD") {
      // Customer pays on pickup/delivery
      heading = "Invoice";
      paid = 0;
      balance = total;
    } else {
      // Non-COD: use paymentType logic
      switch (paymentType) {
        case "delivery":
          paid = delivery?.fee || 0;
          balance = subtotal;
          break;
        case "goods":
          paid = subtotal;
          balance = delivery?.fee || 0;
          break;
        default:
          paid = total;
          balance = 0;
          break;
      }

      if (paymentStatus === "Paid") heading = "Cash Sale";
      if (paymentStatus === "Partial") heading = "Part Payment Invoice";
    }

    return { heading, paid, balance };
  }, [paymentMethod, paymentType, paymentStatus, total, subtotal, delivery]);

  // 📄 Download invoice as PDF
  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoiceNumber}.pdf`);
  };

  // 📤 Share invoice via mobile share API
  const handleShare = async () => {
    if (!navigator.share) {
      alert("Sharing is not supported on this device.");
      return;
    }

    const element = invoiceRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const blob = await (await fetch(canvas.toDataURL("image/png"))).blob();
    const file = new File([blob], `${invoiceNumber}.pdf`, {
      type: "application/pdf",
    });

    try {
      await navigator.share({
        title: "Anyoka Eats Invoice",
        text: "Here is your Anyoka Eats invoice",
        files: [file],
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className={styles.wrapper} ref={invoiceRef}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{heading}</h1>
          <p className={styles.date}>{date}</p>
          {customer && (
            <div className={styles.customerInfo}>
              <p><strong>Customer:</strong> {customer?.names || "N/A"}</p>
              <p><strong>Phone:</strong> {customer?.phoneNumber || "N/A"}</p>
              {customer?.town && <p><strong>Town:</strong> {customer.town}</p>}
            </div>
          )}
        </div>

        <div className={styles.headerRight}>
          <p className={styles.invoiceNumber}>INV: {invoiceNumber}</p>
          {delivery && (
            <>
              <p><strong>Delivery:</strong> {delivery.option}</p>
              <p><strong>Location:</strong> {delivery.location}</p>
            </>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      {description && (
        <div className={styles.descriptionBox}>
          <p>{description}</p>
        </div>
      )}

      {/* TABLE */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Price (Ksh)</th>
            <th>Total (Ksh)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{item.price.toLocaleString()}</td>
              <td>{item.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* SUMMARY */}
      <div className={styles.summary}>
        <div>VAT (16%): <strong>{vat.toLocaleString()}</strong></div>
        <div>Subtotal: <strong>{subtotal.toLocaleString()}</strong></div>
        <div>Total: <strong>{total.toLocaleString()}</strong></div>
        <div>Paid: <strong>{paid.toLocaleString()}</strong></div>
        <div>Balance: <strong>{balance.toLocaleString()}</strong></div>
        <div>Status: <strong>{paymentStatus}</strong></div>
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <p>anyokaeats@gmail.com</p>
        <p>+254 706 251 573</p>
        <p>www.anyokaeats.com</p>
      </div>

      {/* ACTIONS */}
      <div className={styles.printBtnContainer}>
        <button onClick={handleDownloadPDF} className={styles.printBtn}>
          📄 Download / Print
        </button>
        <button onClick={handleShare} className={styles.printBtn}>
          📤 Share
        </button>
      </div>
    </div>
  );
}
