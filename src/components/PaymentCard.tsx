import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { Payment } from '@/view-functions/getSentPayment';
import { convertOctaToApt } from '@/core/utils';
import { MoveAddressType } from '@aptos-labs/ts-sdk';
import { CircleCheckBig, HandCoins } from 'lucide-react';

interface PaymentCardProps {
  payment: Payment
  account: MoveAddressType | undefined
 }

const PaymentCard: React.FC<PaymentCardProps> = ({ payment, account })  => {

  return (
    <Card className="w-full max-w-sm  bg-zinc-900 text-white border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg flex flex-row gap-2 font-semibold">{payment.sender == account ? "Payment Sent" : "Payment Received"}
          {payment.sender == account ? <CircleCheckBig color='green' strokeWidth={2} /> : <HandCoins color='green' strokeWidth={2} />}
        </CardTitle>
        <CardDescription className="text-gray-400">
          From: {payment.sender.slice(0, 6)}...{payment.sender.slice(-4)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Amount:</span>
          <Badge variant="secondary" className={`${payment.sender == account ? "text-red-400 bg-red-900" : "text-green-400 bg-green-900" }`}>
            {convertOctaToApt(payment.amount)} APT
          </Badge>
        </div>
        <div className="text-sm">
          <p><span className="font-medium">Note:</span> {payment.note}</p>
        </div>
      </CardContent>
      <CardFooter className="text-xs font-medium text-gray-400">
        {payment.timestamp}
      </CardFooter>
    </Card>
  );
};

export default PaymentCard;