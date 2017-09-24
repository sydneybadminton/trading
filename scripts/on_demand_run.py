import requests

btcm_response = requests.get('https://api.btcmarkets.net/market/BTC/AUD/tick')
btcm_data = btcm_response.json()
btcm_best_ask = btcm_data['bestAsk']
buy_price_with_fee = btcm_best_ask * 1.007
# This is the price after including withdrawal fee
effective_buy_price = buy_price_with_fee * 1.0005

cs_response = requests.get('https://www.coinspot.com.au/sell/btc/rate/aud')
cs_data = cs_response.json()
cs_rate = float(cs_data['rate'])

profit_percentage = round(((cs_rate - effective_buy_price) / effective_buy_price) * 100, 2)

print "Profit percentage = " + str(profit_percentage) + "%"

ten_k = 10000
btcm_response = requests.get('https://api.btcmarkets.net/market/BTC/AUD/tick')
btcm_data = btcm_response.json()
btcm_lastprice = btcm_data['bestAsk']
effective_amount = ten_k / 1.008
btcm_btc = (effective_amount / btcm_lastprice) - 0.0005

cs_response = requests.get('https://www.coinspot.com.au/sell/btc/rate/aud')
cs_data = cs_response.json()
cs_rate = float(cs_data['rate'])
cs_sellprice = btcm_btc * cs_rate

profit = format((cs_sellprice - ten_k), '.2f')

print "BTCM Ask Price = $" + format((btcm_lastprice * 1.008), '0.2f')
print "BTC bought = " + repr(btcm_btc)
print "CS Rate = $"  + repr(cs_rate)
print "Profit for $10K trade = $" + profit