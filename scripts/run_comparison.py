import requests
from utils import SendGrid

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
print "Profit for 10K trade = $" + profit

if float(profit) > 200.0:
    body = 'BTCM Last Price for 1 BTC = $' + format((btcm_lastprice * 1.008), '0.2f') + '\r\n' + \
           'BTC bought = ' + str(btcm_btc) + '\r\n' + \
           'CS Rate for 1 BTC = $' + str(cs_rate) + '\r\n' + \
           'Profit = $' + str(profit)
    email_ids = []
    email_ids.append("malli.arjun@gmail.com")
    email_ids.append("michaelwookey@gmail.com")
    SendGrid.send_email(email_ids, "no-reply@sendgrid.me",
                            "Profit for $10K trade is $" + repr(profit), body)