from setuptools import find_packages, setup

setup(
    name="predictive_analytics_tool",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "pandas",
        "numpy",
        "scikit-learn",
        "joblib",
        "matplotlib",
    ],
)
