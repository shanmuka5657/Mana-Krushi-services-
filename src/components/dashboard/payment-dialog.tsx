
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPaymentSuccess: () => void;
}

const paymentMethods = [
    { id: "gpay", name: "Google Pay", scheme: "gpay" },
    { id: "phonepe", name: "PhonePe", scheme: "phonepe" },
    { id: "paytm", name: "Paytm", scheme: "paytmmp" },
    { id: "upi", name: "Other UPI Apps", scheme: "upi" },
];

const UPI_ID = "7569114679@ybl";
const PAYEE_NAME = "Mana Krushi Services";
const AMOUNT = "50.00";

export default function PaymentDialog({ isOpen, onOpenChange, onPaymentSuccess }: PaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState("gpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const handlePayment = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (!method) return;
    
    // Construct the UPI URL
    const upiParams = new URLSearchParams({
        pa: UPI_ID,
        pn: PAYEE_NAME,
        am: AMOUNT,
        cu: "INR",
        tn: `Fee for ${PAYEE_NAME}`
    });

    const paymentUrl = `${method.scheme}://pay?${upiParams.toString()}`;

    // Open the payment app URL
    window.open(paymentUrl, '_blank');
    
    setIsProcessing(true);
    onOpenChange(false); // Close the dialog immediately

    // Simulate waiting for payment confirmation
    toast({
      title: "Waiting for Payment...",
      description: "Complete the payment in your selected app. We'll verify it shortly.",
    });

    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
      toast({
        title: "Payment Successful!",
        description: "Your one-time fee has been paid.",
        action: <CheckCircle className="text-green-500" />
      });
    }, 5000); // Wait 5 seconds to simulate verification
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>One-Time Maintenance Fee</DialogTitle>
          <DialogDescription>
            To list your routes, a one-time fee of ₹50 is required for 3 months of service. Please select a payment method.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                <div className="space-y-2">
                    {paymentMethods.map((method) => (
                         <Label 
                            key={method.id} 
                            htmlFor={method.id}
                            className="flex items-center justify-between p-4 border rounded-md cursor-pointer hover:bg-muted/50"
                         >
                            <span>{method.name}</span>
                            <RadioGroupItem value={method.id} id={method.id} />
                         </Label>
                    ))}
                </div>
            </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay ₹50"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
