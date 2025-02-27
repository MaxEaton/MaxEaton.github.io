from flask import Flask, render_template, Blueprint
from fct import fct_blueprint

app = Flask(__name__)
app.register_blueprint(fct_blueprint, url_prefix='/fct')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/resume/')
def resume():
    return render_template('resume.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


if __name__ == '__main__':
    app.run(debug=True)
