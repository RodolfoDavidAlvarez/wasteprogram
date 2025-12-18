"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, X } from "lucide-react";

const ADMIN_PIN = "1634";

interface PinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function PinDialog({
  open,
  onOpenChange,
  onSuccess,
  title = "Admin Verification",
  description = "Enter the 4-digit PIN to continue",
}: PinDialogProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPin(["", "", "", ""]);
      setError(false);
      setShake(false);
      // Focus first input after a short delay
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Check PIN when all digits entered
    if (index === 3 && value) {
      const enteredPin = newPin.join("");
      if (enteredPin === ADMIN_PIN) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin(["", "", "", ""]);
          inputRefs[0].current?.focus();
        }, 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (pin[index] === "" && index > 0) {
        inputRefs[index - 1].current?.focus();
        const newPin = [...pin];
        newPin[index - 1] = "";
        setPin(newPin);
      } else {
        const newPin = [...pin];
        newPin[index] = "";
        setPin(newPin);
      }
      setError(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pastedData.length === 4) {
      const newPin = pastedData.split("");
      setPin(newPin);
      if (pastedData === ADMIN_PIN) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin(["", "", "", ""]);
          inputRefs[0].current?.focus();
        }, 500);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-emerald-600" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div
            className={`flex justify-center gap-3 ${shake ? "animate-shake" : ""}`}
            onPaste={handlePaste}
          >
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`
                  w-14 h-14 text-center text-2xl font-bold rounded-lg border-2
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                  ${error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}
                  transition-colors
                `}
                autoComplete="off"
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-red-600 text-sm mt-3 font-medium">
              Incorrect PIN. Please try again.
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for using PIN protection
export function usePinProtection() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [dialogConfig, setDialogConfig] = useState({
    title: "Admin Verification",
    description: "Enter the 4-digit PIN to continue",
  });

  const requestPin = (
    action: () => void,
    config?: { title?: string; description?: string }
  ) => {
    setPendingAction(() => action);
    if (config) {
      setDialogConfig({
        title: config.title || "Admin Verification",
        description: config.description || "Enter the 4-digit PIN to continue",
      });
    }
    setIsOpen(true);
  };

  const handleSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const PinDialogComponent = (
    <PinDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onSuccess={handleSuccess}
      title={dialogConfig.title}
      description={dialogConfig.description}
    />
  );

  return { requestPin, PinDialogComponent };
}
