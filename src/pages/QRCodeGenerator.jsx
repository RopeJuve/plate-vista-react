import { QRCode } from "react-qrcode";
import { useRef, useState } from 'react';

const QRCodeGenerator = () => {
  const [tableNum, setTableNum] = useState(1);
  const [text, setText] = useState(
    `${import.meta.env.VITE_PLATE_VISTA_URL}/table/${tableNum}`
  );
  const qrRef = useRef(null);

  const handleChange = (e) => {
    const newTableNum = e.target.value;
    setTableNum(newTableNum);
    setText(`${import.meta.env.VITE_PLATE_VISTA_URL}/table/${newTableNum}`);
  };

  const handleDownload = () => {
    const svgElement = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svgElement);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const svgSize = svgElement.getBoundingClientRect();
    canvas.width = svgSize.width;
    canvas.height = svgSize.height;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      context.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `table-${tableNum}-qr-code.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className='h-full'>
      <h1 className="text-2xl font-bold text-center mb-4">QR Code Generator</h1>
      <div className="flex flex-col items-center max-w-screen-md mx-auto md:flex-row md:items-start">
        <div className='flex-grow'>
          <label htmlFor="tableNum" className="block text-lg font-semibold">
            Table Number
          </label>
          <select onChange={handleChange} value={tableNum} className="block border rounded px-2 py-1">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div ref={qrRef} className="mt-4">
          <QRCode
            value={text}
            size={250}
            bgcolor="#ffffff"
            fgcolor="#000000"
          />
          <button
            onClick={handleDownload}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
