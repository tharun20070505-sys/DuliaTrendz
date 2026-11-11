import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const SizeGuideModal = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState('inches'); // 'inches' or 'cm'

  if (!isOpen) return null;

  const sizeChartData = [
    { size: 'XS', bustIn: 32, waistIn: 26, hipIn: 34, bustCm: 81, waistCm: 66, hipCm: 86 },
    { size: 'S', bustIn: 34, waistIn: 28, hipIn: 36, bustCm: 86, waistCm: 71, hipCm: 91 },
    { size: 'M', bustIn: 36, waistIn: 30, hipIn: 38, bustCm: 91, waistCm: 76, hipCm: 96 },
    { size: 'L', bustIn: 38, waistIn: 32, hipIn: 40, bustCm: 96, waistCm: 81, hipCm: 101 },
    { size: 'XL', bustIn: 40, waistIn: 34, hipIn: 42, bustCm: 101, waistCm: 86, hipCm: 106 },
    { size: 'XXL', bustIn: 42, waistIn: 36, hipIn: 44, bustCm: 107, waistCm: 91, hipCm: 112 },
    { size: 'XXXL', bustIn: 44, waistIn: 38, hipIn: 46, bustCm: 112, waistCm: 96, hipCm: 117 },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-ivory-light border border-champagne shadow-elevated rounded-sm max-w-xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal/60 hover:text-burgundy focus:outline-none"
          aria-label="Close"
        >
          <FiX className="w-6 h-6" />
        </button>

        <h3 className="font-serif text-2xl font-bold text-burgundy text-center mb-1">
          Dulia Trendz Sizing Guide
        </h3>
        <p className="text-xs text-charcoal/60 text-center mb-6">
          Find your ideal fit. Standard women's garment body dimensions.
        </p>

        {/* Unit Selector Toggle */}
        <div className="flex justify-center mb-5">
          <div className="bg-ivory border border-champagne rounded-sm p-0.5 inline-flex">
            <button
              type="button"
              onClick={() => setUnit('inches')}
              className={`px-4 py-1 text-xs font-semibold rounded-xs transition-colors ${
                unit === 'inches' ? 'bg-burgundy text-white' : 'text-charcoal hover:text-burgundy'
              }`}
            >
              Inches (in)
            </button>
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-4 py-1 text-xs font-semibold rounded-xs transition-colors ${
                unit === 'cm' ? 'bg-burgundy text-white' : 'text-charcoal hover:text-burgundy'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Sizing Table */}
        <div className="overflow-x-auto border border-champagne/60 rounded-xs mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-burgundy text-white uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4">Size</th>
                <th className="py-2.5 px-4">Bust ({unit === 'inches' ? 'in' : 'cm'})</th>
                <th className="py-2.5 px-4">Waist ({unit === 'inches' ? 'in' : 'cm'})</th>
                <th className="py-2.5 px-4">Hip ({unit === 'inches' ? 'in' : 'cm'})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne/40 bg-white">
              {sizeChartData.map((row, idx) => (
                <tr key={idx} className="hover:bg-ivory/60 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-burgundy">{row.size}</td>
                  <td className="py-2.5 px-4 font-mono text-charcoal">
                    {unit === 'inches' ? row.bustIn : row.bustCm}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-charcoal">
                    {unit === 'inches' ? row.waistIn : row.waistCm}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-charcoal">
                    {unit === 'inches' ? row.hipIn : row.hipCm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Measuring Advice Tips */}
        <div className="bg-ivory/60 border border-champagne/40 p-4 rounded-xs text-xs text-charcoal/80 space-y-1.5">
          <p className="font-semibold text-burgundy">How to Measure:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li><strong>Bust:</strong> Measure around the fullest part of your chest with a relaxed tape.</li>
            <li><strong>Waist:</strong> Measure around the narrowest natural crease of your torso.</li>
            <li><strong>Hip:</strong> Stand with feet together and measure around the widest portion of your hips.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
