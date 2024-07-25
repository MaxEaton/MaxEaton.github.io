from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.route('/resume')
def resume():
    return send_from_directory('static/files', 'MaxEatonResume.pdf')

if __name__ == '__main__':
    app.run(debug=True)
