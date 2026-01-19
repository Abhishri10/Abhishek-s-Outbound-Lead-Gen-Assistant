import React, { useState } from 'react';
import { OutreachStep } from '../types';

interface EmailModalProps {
  outreachSequence: OutreachStep[];
  onClose: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ outreachSequence, onClose }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  if (!outreachSequence || outreachSequence.length === 0) {
    return null;
  }

  const sortedSequence = [...outreachSequence].sort((a, b) => a.step - b.step);
  const currentStep = sortedSequence[activeStepIndex];
  const emailContentToCopy = `Subject: ${currentStep.subject}\n\n${currentStep.body}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-slate-800">Generated Outreach Sequence</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="px-4 pt-4 border-b border-slate-200">
          <nav className="flex -mb-px space-x-6">
            {sortedSequence.map((step, index) => (
              <button
                key={step.step}
                onClick={() => setActiveStepIndex(index)}
                className={`px-1 py-3 font-medium text-sm whitespace-nowrap ${
                  activeStepIndex === index
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Step {step.step}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto">
           <div className="mb-4">
              <p className="text-sm"><span className="font-semibold text-slate-500">Subject:</span> <span className="text-slate-800">{currentStep.subject}</span></p>
            </div>
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{currentStep.body}</pre>
        </div>
        <div className="p-4 border-t flex justify-end bg-slate-50 rounded-b-lg">
          <button
            onClick={() => navigator.clipboard.writeText(emailContentToCopy)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Copy Text
          </button>
          <button 
            onClick={onClose} 
            className="ml-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
