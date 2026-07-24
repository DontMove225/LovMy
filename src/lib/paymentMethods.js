import { SiPaypal, SiStripe } from 'react-icons/si';

export const PAYMENT_METHODS = [
  { key: 'paypal', label: 'PayPal', description: 'Payer avec votre compte PayPal.', icon: SiPaypal, bg: 'rgba(0,112,186,0.15)', color: '#2997D8' },
  { key: 'stripe', label: 'Carte bancaire', description: 'Visa, Mastercard, Amex et plus — via Stripe.', icon: SiStripe, bg: 'rgba(99,91,255,0.15)', color: '#8D87FF' },
];
