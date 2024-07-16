from setuptools import setup, find_packages

setup(
    name='site-front',
    version='1.0.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Flask',
        'python-dotenv',
    ],
    entry_points={
        'console_scripts': [
            'flask_app = run:main',
        ],
    },
)
