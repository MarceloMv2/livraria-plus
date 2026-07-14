'use client';

import { useState } from 'react';
import { Check, X, Sparkles, ArrowRight, Shield, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    id: 'monthly',
    name: 'Mensal',
    icon: Zap,
    monthlyPrice: 19.90,
    annualPrice: 29.90,
    lifetimePrice: null,
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-200',
    badge: null,
    features: [
      { text: 'Acesso a todos os 18.000+ livros', included: true },
      { text: 'Leitor integrado (EPUB/PDF)', included: true },
      { text: 'Leitura offline de até 5 livros/mês', included: true },
      { text: 'Marcações e favoritos', included: true },
      { text: 'Recomendações personalizadas', included: true },
      { text: 'Suporte por e-mail', included: true },
      { text: 'Leitura offline ilimitada', included: false },
      { text: 'Acesso anticipado a lançamentos', included: false },
      { text: 'Audiolivros', included: false },
    ],
  },
  {
    id: 'annual',
    name: 'Anual',
    icon: Crown,
    monthlyPrice: 14.90,
    annualPrice: 178.80,
    lifetimePrice: null,
    color: 'from-primary-500 to-primary-600',
    borderColor: 'border-primary-300',
    badge: 'MAIS POPULAR',
    features: [
      { text: 'Acesso a todos os 18.000+ livros', included: true },
      { text: 'Leitor integrado (EPUB/PDF)', included: true },
      { text: 'Leitura offline ilimitada', included: true },
      { text: 'Marcações e favoritos', included: true },
      { text: 'Recomendações personalizadas', included: true },
      { text: 'Suporte prioritário', included: true },
      { text: 'Leitura offline ilimitada', included: true },
      { text: 'Acesso anticipado a lançamentos', included: true },
      { text: 'Audiolivros', included: false },
    ],
  },
  {
    id: 'lifetime',
    name: 'Vitalício',
    icon: Sparkles,
    monthlyPrice: null,
    annualPrice: null,
    lifetimePrice: 349.90,
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-200',
    badge: 'MELHOR VALOR',
    features: [
      { text: 'Acesso a todos os 18.000+ livros', included: true },
      { text: 'Leitor integrado (EPUB/PDF)', included: true },
      { text: 'Leitura offline ilimitada', included: true },
      { text: 'Marcações e favoritos', included: true },
      { text: 'Recomendações personalizadas', included: true },
      { text: 'Suporte VIP', included: true },
      { text: 'Leitura offline ilimitada', included: true },
      { text: 'Acesso anticipado a lançamentos', included: true },
      { text: 'Audiolivros inclusos', included: true },
    ],
  },
];

const paymentMethods = [
  { name: 'Cartão de Crédito', icon: '💳', description: 'Visa, Mastercard, Elo' },
  { name: 'PIX', icon: '📱', description: 'Aprovação instantânea' },
  { name: 'Boleto', icon: '📄', description: 'Até 3 dias úteis' },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.id === 'lifetime') return `R$ ${plan.lifetimePrice!.toFixed(2).replace('.', ',')}`;
    if (plan.id === 'annual') {
      const monthly = plan.annualPrice! / 12;
      return `R$ ${monthly.toFixed(2).replace('.', ',')}`;
    }
    return `R$ ${plan.monthlyPrice!.toFixed(2).replace('.', ',')}`;
  };

  const getPeriod = (plan: typeof plans[0]) => {
    if (plan.id === 'lifetime') return 'pagamento único';
    if (plan.id === 'annual') return '/mês (anual)';
    return '/mês';
  };

  const getDiscount = (plan: typeof plans[0]) => {
    if (plan.id === 'annual') {
      const totalAnnual = plan.annualPrice!;
      const monthlyTotal = plans[0].monthlyPrice! * 12;
      const discount = ((monthlyTotal - totalAnnual) / monthlyTotal) * 100;
      return Math.round(discount);
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-surface-900">
          Planos que cabem no seu bolso
        </h1>
        <p className="mt-4 text-lg text-surface-500 max-w-2xl mx-auto">
          Escolha o plano ideal para você. Todos incluem acesso completo ao acervo de 18.000+ livros.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 inline-flex items-center rounded-full bg-surface-100 p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-surface-900 shadow-md'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
              billingCycle === 'annual'
                ? 'bg-white text-surface-900 shadow-md'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            Anual
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const discount = getDiscount(plan);
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 ${plan.borderColor} bg-white p-8 transition-all hover:shadow-xl ${
                plan.badge ? 'scale-105 shadow-xl' : 'shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r ${plan.color} px-4 py-1 text-xs font-bold text-white shadow-lg`}>
                  {plan.badge}
                </div>
              )}

              <div className={`mb-6 inline-flex rounded-xl bg-gradient-to-r ${plan.color} p-3 text-white`}>
                <plan.icon className="h-6 w-6" />
              </div>

              <h3 className="text-xl font-bold text-surface-900">{plan.name}</h3>

              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-surface-900">{getPrice(plan)}</span>
                  <span className="text-sm text-surface-500">{getPeriod(plan)}</span>
                </div>
                {discount && discount > 0 && (
                  <p className="mt-1 text-sm text-green-600 font-medium">
                    Economize {discount}% em relação ao mensal
                  </p>
                )}
                {plan.id === 'annual' && (
                  <p className="mt-1 text-xs text-surface-400">
                    R$ {plan.annualPrice!.toFixed(2).replace('.', ',')} cobrados anualmente
                  </p>
                )}
              </div>

              <a
                href={
                  plan.id === 'monthly' ? process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_MONTHLY || '#'
                  : plan.id === 'annual' ? process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_ANNUAL || '#'
                  : process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_LIFETIME || '#'
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${plan.color} py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]`}
              >
                Começar Agora
                <ArrowRight className="h-4 w-4" />
              </a>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 shrink-0 text-surface-300 mt-0.5" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-surface-700' : 'text-surface-400'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Payment Methods */}
      <div className="mt-16 text-center">
        <h2 className="text-xl font-bold text-surface-900 mb-6">Formas de Pagamento</h2>
        <div className="flex justify-center gap-6">
          {paymentMethods.map((method) => (
            <div key={method.name} className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white px-6 py-4">
              <span className="text-2xl">{method.icon}</span>
              <div className="text-left">
                <p className="text-sm font-medium text-surface-900">{method.name}</p>
                <p className="text-xs text-surface-500">{method.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust */}
      <div className="mt-12 flex justify-center gap-8 text-center">
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <Shield className="h-5 w-5 text-green-500" />
          Pagamento 100% seguro
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <X className="h-5 w-5 text-surface-400" />
          Cancele quando quiser
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <Check className="h-5 w-5 text-primary-500" />
          7 dias de garantia
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-20 mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold text-surface-900 text-center mb-8">Perguntas Frequentes</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Posso cancelar a assinatura a qualquer momento?',
              a: 'Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais. O acesso continua até o final do período já pago.',
            },
            {
              q: 'Como funciona a leitura offline?',
              a: 'Ao abrir um livro, o conteúdo é automaticamente armazenado no seu navegador. Você pode ler sem conexão com a internet a qualquer momento. No plano Mensal, o limite é de 5 livros offline por mês.',
            },
            {
              q: 'Os livros têm DRM?',
              a: 'Sim, todos os livros possuem proteção DRM básica para evitar pirataria, garantindo a segurança do conteúdo para autores e editoras.',
            },
            {
              q: 'Posso trocar de plano depois?',
              a: 'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor é ajustado proporcionalmente.',
            },
          ].map((faq) => (
            <details key={faq.q} className="group rounded-2xl border border-surface-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-surface-900">
                {faq.q}
                <span className="ml-2 text-surface-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-3 text-sm text-surface-600 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
