from flask import Flask, redirect, url_for
import webbrowser

app = Flask(__name__)

target_url = "https://cdn.botpress.cloud/webchat/v2.2/shareable.html?configUrl=https://files.bpcontent.cloud/2024/11/24/17/20241124170024-JMW06R0Z.json"

@app.route('/')
def chatbot():
    return redirect(target_url)

if __name__ == '__main__':
    webbrowser.open(target_url)
    app.run(debug=True)