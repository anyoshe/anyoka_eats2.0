import React, { useRef } from "react";
import styles from "./Invoice.module.css";

export default function Invoice({
  date,
  invoiceNumber,
  description,
  items,
  vat,
  subtotal,
  total,
}) {
  const invoiceRef = useRef();

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Invoice</title>");
    WinPrint.document.write(
      `<style>${document.querySelector("style")?.innerHTML || ""}</style>`
    );
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(printContent.outerHTML);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  return (
    <div className={styles.wrapper} ref={invoiceRef}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Invoice</h1>
          <p className={styles.date}>{date}</p>
        </div>
        <div className={styles.headerRight}>
          <p className={styles.invoiceNumber}>INV : {invoiceNumber}</p>
        </div>
      </div>

      <div className={styles.descriptionBox}>
        <p>{description}</p>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
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

      <div className={styles.summary}>
        <div>VAT (16%) : <strong>{vat.toLocaleString()}</strong></div>
        <div>Subtotal : <strong>{subtotal.toLocaleString()}</strong></div>
        <div>Total : <strong>{total.toLocaleString()}</strong></div>
      </div>

      <div className={styles.footer}>
        <p>anyokaeats@gmail.com</p>
        <p>+254 706 251 573</p>
        <p>www.anyokaeats.com</p>
      </div>

      <div className={styles.printBtnContainer}>
        <button onClick={handlePrint} className={styles.printBtn}>
          Download / Print Invoice
        </button>
      </div>
    </div>
  );
}
