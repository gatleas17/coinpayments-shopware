<?php

declare(strict_types=1);

namespace CoinPayments\Handler;

use CoinPayments\Service\ConfigService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Checkout\Payment\Cart\AsyncPaymentTransactionStruct;
use Shopware\Core\Checkout\Payment\Exception\AsyncPaymentProcessException;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\ContainsFilter;
use Shopware\Core\Checkout\Payment\Exception\CustomerCanceledAsyncPaymentException;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\AsynchronousPaymentHandlerInterface;
use Shopware\Core\Framework\Store\Services\StoreService;
use CoinPayments\Api\Coinpayments;

class PaymentHandler implements AsynchronousPaymentHandlerInterface
{

    const PLUGIN_CONFIG_DOMAIN = 'CoinPayments.config.';

    /**
     * @var OrderTransactionStateHandler
     */
    protected $transactionStateHandler;
    /**
     * @var StoreService
     */
    protected $storeService;
    /**
     * @var ConfigService
     */
    protected $configService;

    /**
     * @param OrderTransactionStateHandler $transactionStateHandler
     * @param ConfigService $configService
     * @param StoreService $storeService
     */
    public function __construct(OrderTransactionStateHandler $transactionStateHandler,
                                ConfigService $configService,
                                StoreService $storeService
    )
    {
        $this->transactionStateHandler = $transactionStateHandler;
        $this->configService = $configService;
        $this->storeService = $storeService;
    }

    /**
     * Redirects to the payment page
     *
     * @param AsyncPaymentTransactionStruct $transaction
     * @param RequestDataBag $dataBag
     * @param SalesChannelContext $salesChannelContext
     * @return RedirectResponse
     * @throws AsyncPaymentProcessException
     * @throws \Exception
     */
    public function pay(
        AsyncPaymentTransactionStruct $transaction,
        RequestDataBag $dataBag,
        SalesChannelContext $salesChannelContext
    ): RedirectResponse
    {

        $totalAmount = $transaction->getOrderTransaction()->getAmount()->getTotalPrice();
        $currency = $salesChannelContext->getCurrency()->getIsoCode();
        $config = $this->configService->getConfig();
        try {

            $invoice = $this->createInvoice($config, $currency, $totalAmount, $transaction->getOrderTransaction()->getOrderId());

            $params = array(
                'invoice-id' => $invoice['id'],
                'success-url' => $transaction->getReturnUrl(),
                'cancel-url' => $transaction->getReturnUrl(),
            );

            $redirectUrl = sprintf('%s/%s?%s', Coinpayments::API_URL, Coinpayments::API_CHECKOUT_ACTION, http_build_query($params));
        } catch (\Exception $e) {
            throw new AsyncPaymentProcessException(
                $transaction->getOrderTransaction()->getId(),
                'An error occurred during the communication with external payment gateway' . PHP_EOL . $e->getMessage()
            );
        }

        // Redirect to external gateway
        return new RedirectResponse($redirectUrl);
    }

    /**
     * @param AsyncPaymentTransactionStruct $transaction
     * @param Request $request
     * @param SalesChannelContext $salesChannelContext
     * @throws CustomerCanceledAsyncPaymentException
     */
    public function finalize(AsyncPaymentTransactionStruct $transaction, Request $request, SalesChannelContext $salesChannelContext): void
    {
        $invoice = $request->get("invoice");
        if ($invoice['status'] == 'Completed') {
            $this->transactionStateHandler->paid($transaction->getOrderTransaction()->getId(), $salesChannelContext->getContext());
        } elseif ($invoice['status'] == 'Cancelled') {
            $this->transactionStateHandler->cancel($transaction->getOrderTransaction()->getId(), $salesChannelContext->getContext());
        } else {
            $this->transactionStateHandler->process($transaction->getOrderTransaction()->getId(), $salesChannelContext->getContext());
        }
    }

    /**
     * @param $config
     * @param $currencyCode
     * @param $total
     * @param $orderId
     * @return bool|mixed
     * @throws \Exception
     */
    public function createInvoice($config, $currencyCode, $total, $orderId)
    {
        $invoice = null;
        $api = new Coinpayments($this->storeService);

        $clientId = $config['clientId'];
        $clientSecret = $config['clientSecret'];

        $invoiceId = sprintf('%s|%s', md5($api->request->getSchemeAndHttpHost()), $orderId);

        $coinCurrency = $api->getCoinCurrency($currencyCode);

        $amount = number_format($total, $coinCurrency['decimalPlaces'], '', '');;
        $displayValue = $total;

        if ($config['webhooks']) {
            $resp = $api->createMerchantInvoice($clientId, $clientSecret, $coinCurrency['id'], $invoiceId, $amount, $displayValue);
            $invoice = array_shift($resp['invoices']);
        } else {
            $invoice = $api->createSimpleInvoice($clientId, $coinCurrency['id'], $invoiceId, $amount, $displayValue);
        }

        return $invoice;
    }

}