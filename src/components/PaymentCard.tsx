import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { Payment } from '@/view-functions/getSentPayment';
import { convertOctaToApt } from '@/core/utils';
import { MoveAddressType } from '@aptos-labs/ts-sdk';
 interface PaymentCardProps {
  payment: Payment
  account: MoveAddressType | undefined
 }
const PaymentCard: React.FC<PaymentCardProps> = ({ payment, account })  => {

  return (
    <Card className="w-full max-w-sm  bg-zinc-800 text-white border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{payment.sender == account ? "Payment Sent" : "Payment Received"}</CardTitle>
        <CardDescription className="text-gray-400">
          {payment.timestamp}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Amount:</span>
          <Badge variant="secondary" className="text-green-400 bg-green-900">
            {convertOctaToApt(payment.amount)} APT
          </Badge>
        </div>
        <div className="text-sm">
          <p><span className="font-medium">Note:</span> {payment.note}</p>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-400">
        From: {payment.sender.slice(0, 6)}...{payment.sender.slice(-4)}
      </CardFooter>
    </Card>
  );
};

export default PaymentCard;