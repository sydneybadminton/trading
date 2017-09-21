import requests
from utils import SendMail

class RunComparison:
    @staticmethod
    def comparison():
        ten_k = 10000
        btcm_response = requests.get('https://api.btcmarkets.net/market/BTC/AUD/tick')
        btcm_data = btcm_response.json()
        btcm_lastprice = btcm_data['lastPrice']
        effective_amount = ten_k / 1.008
        btcm_btc = (effective_amount / btcm_lastprice) - 0.0005

        cs_response = requests.get('https://www.coinspot.com.au/sell/btc/rate/aud')
        cs_data = cs_response.json()
        cs_rate = float(cs_data['rate'])
        cs_sellprice = btcm_btc * cs_rate

        profit = format((cs_sellprice - ten_k), '.2f')

        print "BTCM Last Price = $" + format((btcm_lastprice * 1.008), '0.2f')
        print "BTC bought = " + repr(btcm_btc)
        print "CS Rate = $"  + repr(cs_rate)
        print "Profit for $10K trade = $" + profit

        result = "{\"BTCMLastPrice\":" + format((btcm_lastprice * 1.008), '0.2f') + "," + \
                   "\"BTCBought\":" + str(btcm_btc) + "," + \
                   "\"CSRate\":" + str(cs_rate) + "," + \
                   "\"10KProfit\":" + str(profit) + "}"

        return "10K Profit = $" + str(profit)