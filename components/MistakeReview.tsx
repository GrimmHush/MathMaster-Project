import React from 'react';
import { useGameStore } from '../store/gameStore';
import { XCircle, CheckCircle, ArrowRight } from 'lucide-react';

export const MistakeReview: React.FC = () => {
  const { roundMistakes, inferredAge } = useGameStore();

  if (roundMistakes.length === 0) {
    return (
      <div className="p-8 bg-gray-900 rounded-2xl border border-gray-800 text-center">
        <h3 className="text-2xl font-bold text-green-400 mb-2">Flawless Round!</h3>
        <p className="text-gray-400">You didn't make a single mistake. Incredible work!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <h3 className="text-2xl font-bold text-white mb-4">Round Review</h3>
      {roundMistakes.map((mistake, idx) => {
        const { problem, selectedAnswer } = mistake;
        const isAdvanced = problem.difficulty > 1 || inferredAge === '11-14';

        return (
          <div key={idx} className="bg-gray-800 p-6 rounded-2xl border-l-4 border-red-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-4 text-xl font-bold text-white mb-2">
                <span>{problem.num1} {problem.operation} {problem.num2}</span>
                <ArrowRight className="w-5 h-5 text-gray-500" />
                <span className="text-green-400 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> {problem.correctAnswer}</span>
              </div>
              <div className="text-red-400 flex items-center gap-2 text-sm md:text-base">
                <XCircle className="w-4 h-4"/> You answered: {selectedAnswer !== null ? selectedAnswer : 'Time Out'}
              </div>
            </div>

            {/* Adaptive Explanation Engine */}
            <div className="bg-gray-900 p-4 rounded-xl w-full md:w-1/2 text-gray-300 text-sm md:text-base">
              {!isAdvanced ? (
                 <p><span className="font-bold text-cyan-400">Hint:</span> Think about adding/subtracting in smaller chunks!</p>
              ) : (
                <div className="space-y-2">
                  <p className="font-bold text-purple-400">Step-by-Step Breakdown:</p>
                  {problem.operation === '*' && (
                     <p>Break it down: ({problem.num1} × 10) +/- the remainder. Practice your {problem.num1} times tables!</p>
                  )}
                  {problem.operation === '/' && (
                     <p>Division is backwards multiplication. What number times {problem.num2} equals {problem.num1}? ({problem.correctAnswer} × {problem.num2} = {problem.num1})</p>
                  )}
                  {(problem.operation === '+' || problem.operation === '-') && (
                     <p>Align the numbers by their place value (tens and ones). Carry over or borrow carefully!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};