// src/components/TransferForm.js - 이체 폼 컴포넌트
import React, { useState } from 'react';
import { processWithdrawTransfer, processDepositTransfer } from '../utils/kftc';
import { BANK_CODES } from '../config/kftc';

function TransferForm({ sourceAccount, onTransferComplete }) {
  const [transferType, setTransferType] = useState('withdraw'); // 'withdraw' or 'deposit'
  const [formData, setFormData] = useState({
    amount: '',
    receiverName: '',
    receiverBankCode: '',
    receiverAccountNum: '',
    transferPurpose: 'TR',
    message: '',
    nameCheckOption: 'on'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sourceAccount) {
      alert('출금 계좌를 선택해주세요.');
      return;
    }

    if (!formData.amount || !formData.receiverName || !formData.receiverAccountNum) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const transferData = {
        fintechUseNum: sourceAccount.fintechUseNum,
        cntrAccountType: 'N',
        cntrAccountNum: sourceAccount.accountNum,
        dpsWdPassPhrase: '송금',
        dpsPrintContent: formData.message || '송금',
        wdPrintContent: formData.message || '송금',
        tranAmt: formData.amount,
        reqClientName: sourceAccount.accountHolderName,
        reqClientBankCode: sourceAccount.bankCodeStd,
        reqClientAccountNum: sourceAccount.accountNum,
        reqClientFintechUseNum: sourceAccount.fintechUseNum,
        transferPurpose: formData.transferPurpose,
        recvClientName: formData.receiverName,
        recvClientBankCode: formData.receiverBankCode,
        recvClientAccountNum: formData.receiverAccountNum,
        nameCheckOption: formData.nameCheckOption
      };

      let response;
      if (transferType === 'withdraw') {
        response = await processWithdrawTransfer(transferData);
      } else {
        response = await processDepositTransfer(transferData);
      }

      setResult(response);
      
      if (response.rspCode === 'A0000') {
        alert('이체가 완료되었습니다.');
        onTransferComplete?.(response);
        // 폼 초기화
        setFormData({
          amount: '',
          receiverName: '',
          receiverBankCode: '',
          receiverAccountNum: '',
          transferPurpose: 'TR',
          message: '',
          nameCheckOption: 'on'
        });
      } else {
        alert(`이체 실패: ${response.rspMessage}`);
      }

    } catch (error) {
      console.error('이체 처리 실패:', error);
      alert(`이체 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">계좌 이체</h2>

        {/* 출금 계좌 정보 */}
        {sourceAccount && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">출금 계좌</h3>
            <p className="text-sm text-gray-600">
              {BANK_CODES[sourceAccount.bankCodeStd]} {sourceAccount.accountNumMasked}
            </p>
            <p className="text-sm text-gray-600">
              예금주: {sourceAccount.accountHolderName}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이체 유형 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이체 유형
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transferType"
                  value="withdraw"
                  checked={transferType === 'withdraw'}
                  onChange={(e) => setTransferType(e.target.value)}
                  className="mr-2"
                />
                출금이체 (송금)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transferType"
                  value="deposit"
                  checked={transferType === 'deposit'}
                  onChange={(e) => setTransferType(e.target.value)}
                  className="mr-2"
                />
                입금이체 (수취)
              </label>
            </div>
          </div>

          {/* 이체 금액 */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              이체 금액 *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="이체할 금액을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
              max="999999999"
            />
          </div>

          {/* 받는 분 은행 */}
          <div>
            <label htmlFor="receiverBankCode" className="block text-sm font-medium text-gray-700 mb-2">
              받는 분 은행 *
            </label>
            <select
              id="receiverBankCode"
              name="receiverBankCode"
              value={formData.receiverBankCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">은행을 선택하세요</option>
              {Object.entries(BANK_CODES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>

          {/* 받는 분 계좌번호 */}
          <div>
            <label htmlFor="receiverAccountNum" className="block text-sm font-medium text-gray-700 mb-2">
              받는 분 계좌번호 *
            </label>
            <input
              type="text"
              id="receiverAccountNum"
              name="receiverAccountNum"
              value={formData.receiverAccountNum}
              onChange={handleInputChange}
              placeholder="'-' 없이 숫자만 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              pattern="[0-9]+"
              title="숫자만 입력 가능합니다"
            />
          </div>

          {/* 받는 분 성명 */}
          <div>
            <label htmlFor="receiverName" className="block text-sm font-medium text-gray-700 mb-2">
              받는 분 성명 *
            </label>
            <input
              type="text"
              id="receiverName"
              name="receiverName"
              value={formData.receiverName}
              onChange={handleInputChange}
              placeholder="받는 분 성명을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength="20"
            />
          </div>

          {/* 이체 용도 */}
          <div>
            <label htmlFor="transferPurpose" className="block text-sm font-medium text-gray-700 mb-2">
              이체 용도
            </label>
            <select
              id="transferPurpose"
              name="transferPurpose"
              value={formData.transferPurpose}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TR">송금</option>
              <option value="ST">결제</option>
              <option value="RC">충전</option>
            </select>
          </div>

          {/* 받는 분 통장 표시 */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              받는 분 통장 표시
            </label>
            <input
              type="text"
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="받는 분 통장에 표시될 내용"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength="20"
            />
          </div>

          {/* 수취인 성명 검증 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수취인 성명 검증
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="nameCheckOption"
                  value="on"
                  checked={formData.nameCheckOption === 'on'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                검증함
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="nameCheckOption"
                  value="off"
                  checked={formData.nameCheckOption === 'off'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                검증하지 않음
              </label>
            </div>
          </div>

          {/* 이체 버튼 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !sourceAccount}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  이체 처리 중...
                </div>
              ) : (
                `${transferType === 'withdraw' ? '출금' : '입금'}이체 실행`
              )}
            </button>
          </div>
        </form>

        {/* 이체 결과 */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.rspCode === 'A0000' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-medium mb-2 ${
              result.rspCode === 'A0000' ? 'text-green-800' : 'text-red-800'
            }`}>
              이체 결과
            </h3>
            <div className="text-sm space-y-1">
              <p>응답코드: {result.rspCode}</p>
              <p>응답메시지: {result.rspMessage}</p>
              {result.rspCode === 'A0000' && (
                <>
                  <p>은행거래ID: {result.bankTranId}</p>
                  <p>거래일자: {result.bankTranDate}</p>
                  <p>이체금액: {new Intl.NumberFormat('ko-KR').format(result.tranAmt)}원</p>
                  {result.wdLimitRemainAmt && (
                    <p>출금한도잔여: {new Intl.NumberFormat('ko-KR').format(result.wdLimitRemainAmt)}원</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransferForm;