import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { useEnrollments, Course, PaymentData } from '@/hooks/useEnrollments';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Shield,
  CheckCircle,
  Clock,
  Star,
  Users,
  Award,
  X,
  Lock,
} from 'lucide-react';

interface PaymentModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PaymentModal({ course, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { t, language } = useI18n();
  const { enrollInCourse, isProcessing } = useEnrollments();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'stripe'>('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
  });
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);

  if (!course) return null;

  const finalPrice = course.originalPrice && course.discount 
    ? course.price 
    : course.price;

  const savings = course.originalPrice && course.discount 
    ? course.originalPrice - course.price 
    : 0;

  const handleCardInputChange = (field: keyof typeof cardDetails) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;
    
    // Format card number
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) value = value.slice(0, 19);
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      if (value.length > 5) value = value.slice(0, 5);
    }
    
    // Format CVV
    if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const validateCardDetails = () => {
    if (paymentMethod === 'credit_card') {
      const { cardNumber, expiryDate, cvv, cardHolder } = cardDetails;
      
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        return 'Invalid card number';
      }
      
      if (!expiryDate || expiryDate.length !== 5) {
        return 'Invalid expiry date';
      }
      
      if (!cvv || cvv.length !== 3) {
        return 'Invalid CVV';
      }
      
      if (!cardHolder.trim()) {
        return 'Card holder name is required';
      }
    }
    
    return null;
  };

  const handlePayment = async () => {
    if (!isAgreedToTerms) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'يجب الموافقة على الشروط والأحكام'
          : 'You must agree to the terms and conditions',
        variant: 'destructive',
      });
      return;
    }

    const validationError = validateCardDetails();
    if (validationError) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    try {
      const paymentData: PaymentData = {
        courseId: course.id,
        amount: finalPrice,
        paymentMethod,
        ...(paymentMethod === 'credit_card' && { cardDetails }),
      };

      await enrollInCourse(course, paymentData);

      toast({
        title: language === 'ar' ? 'تم الدفع بنجاح' : 'Payment Successful',
        description: language === 'ar' 
          ? `تم تسجيلك في دورة ${course.title} بنجاح`
          : `Successfully enrolled in ${course.title}`,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'فشل الدفع' : 'Payment Failed',
        description: error.message || (language === 'ar' 
          ? 'حدث خطأ أثناء معالجة الدفع'
          : 'An error occurred while processing payment'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {language === 'ar' ? 'إتمام عملية الشراء' : 'Complete Your Purchase'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' 
              ? 'ادفع بأمان واحصل على وصول فوري للدورة'
              : 'Pay securely and get instant access to the course'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-20 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">by {course.instructor}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{course.rating}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>{language === 'ar' ? 'السعر الأصلي' : 'Original Price'}</span>
                  <span className={course.originalPrice ? 'line-through text-muted-foreground' : ''}>
                    ${course.originalPrice || course.price}
                  </span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{language === 'ar' ? 'الخصم' : 'Discount'}</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>{language === 'ar' ? 'المجموع' : 'Total'}</span>
                  <span>${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{language === 'ar' ? 'وصول مدى الحياة' : 'Lifetime access'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span>{language === 'ar' ? 'شهادة إتمام' : 'Certificate of completion'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>{language === 'ar' ? 'ضمان استرداد 30 يوم' : '30-day money-back guarantee'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'اختر طريقة الدفع' : 'Select Payment Method'}</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'}
                      </div>
                    </SelectItem>
                    <SelectItem value="paypal">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-600 rounded-sm" />
                        PayPal
                      </div>
                    </SelectItem>
                    <SelectItem value="stripe">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-600 rounded-sm" />
                        Stripe
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Credit Card Form */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardHolder">
                      {language === 'ar' ? 'اسم حامل البطاقة' : 'Card Holder Name'}
                    </Label>
                    <Input
                      id="cardHolder"
                      value={cardDetails.cardHolder}
                      onChange={handleCardInputChange('cardHolder')}
                      placeholder={language === 'ar' ? 'الاسم كما يظهر على البطاقة' : 'Name as it appears on card'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">
                      {language === 'ar' ? 'رقم البطاقة' : 'Card Number'}
                    </Label>
                    <Input
                      id="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardInputChange('cardNumber')}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">
                        {language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
                      </Label>
                      <Input
                        id="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardInputChange('expiryDate')}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardInputChange('cvv')}
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal/Stripe Info */}
              {paymentMethod !== 'credit_card' && (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? `ستتم إعادة توجيهك إلى ${paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'} لإتمام الدفع`
                      : `You will be redirected to ${paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'} to complete payment`
                    }
                  </p>
                </div>
              )}

              {/* Terms Agreement */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={isAgreedToTerms}
                  onChange={(e) => setIsAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  {language === 'ar' 
                    ? 'أوافق على الشروط والأحكام وسياسة الخصوصية'
                    : 'I agree to the Terms & Conditions and Privacy Policy'
                  }
                </Label>
              </div>

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !isAgreedToTerms}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>
                      {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>
                      {language === 'ar' 
                        ? `ادفع $${finalPrice.toFixed(2)} بأمان`
                        : `Pay $${finalPrice.toFixed(2)} Securely`
                      }
                    </span>
                  </div>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {language === 'ar' 
                  ? '🔒 معاملتك آمنة ومشفرة'
                  : '🔒 Your transaction is secure and encrypted'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}