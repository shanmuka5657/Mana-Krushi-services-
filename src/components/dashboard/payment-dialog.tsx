
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from 'qrcode.react';

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPaymentSuccess: () => void;
  amount: string;
  title: string;
  description: string;
}

const UPI_ID = "7671926567@ibl";
const PAYEE_NAME = "Avula Shanmuka Srinivas";

export default function PaymentDialog({ isOpen, onOpenChange, onPaymentSuccess, amount, title, description }: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Basic check for mobile device
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);
  
  const upiParams = new URLSearchParams({
      pa: UPI_ID,
      pn: PAYEE_NAME,
      am: amount,
      cu: "INR",
      tn: `Payment for service - ${title}`
  });

  const paymentUrl = `upi://pay?${upiParams.toString()}`;
  
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    onOpenChange(false); // Close the dialog immediately

    // Simulate waiting for payment confirmation
    toast({
      title: "Waiting for Payment...",
      description: "Once you complete the payment, we will verify it shortly. You may need to refresh the page.",
    });

    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 8000); // Wait 8 seconds to simulate verification and give user time
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      toast({ title: "UPI ID Copied!" });
    }, () => {
      toast({ title: "Failed to copy", variant: "destructive" });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 flex flex-col items-center gap-4">
          {isMobile ? (
             <Button asChild size="lg" className="w-full">
                <a href={paymentUrl}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Pay ₹{amount} with UPI
                </a>
            </Button>
          ) : (
            <div className="p-4 bg-white rounded-lg border">
                <QRCode value={paymentUrl} size={200} level="H" />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Or pay to this UPI ID:</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-mono font-semibold">{UPI_ID}</p>
              <Button size="icon" variant="ghost" onClick={copyToClipboard} className="h-7 w-7">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleConfirmPayment} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `I have paid ₹${amount}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
