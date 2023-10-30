import pandas as pd
import dash
from dash import dcc, html
import plotly.express as px
import plotly.graph_objects as go

# Read data from the CSV file
try:
    df = pd.read_csv('data.csv')
except pd.errors.EmptyDataError:
    df = pd.DataFrame()

# Create a figure using Plotly
if not df.empty:
    fig = px.bar(df, x='Attraction', y='Rating', title='Attraction Ratings in Santa Barbara')
else:
    fig = go.Figure()  # An empty figure

app = dash.Dash(__name__)

app.layout = html.Div([
    dcc.Graph(figure=fig)
])

if __name__ == '__main__':
    app.run_server(debug=True)
