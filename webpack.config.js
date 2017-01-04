
const path = require('path'),
    webpack = require('webpack'),
    ExtractTextPlugin = require("extract-text-webpack-plugin");

const envConfig  = {

    getStage: function(){
        return !process.env.RAILS_ENV ? 'development' : process.env.RAILS_ENV;
    },
    inDevelopment: function () {
        var stage = this.getStage();
        return stage == 'development';
    },

    inProduction: function () {
        return ['production', 'preproduction'].indexOf(this.getStage()) >= 0;
    },

    getCDN: function() {
        var CDNs = {
            qa: 'd2jq5p9fb3us4h.cloudfront.net',
            staging: 'd17pwufp6j13bu.cloudfront.net',
            'staging-2': 'd2kkumcy9vcw22.cloudfront.net',
            'qa-2': 'd2avcxxv2hdx66.cloudfront.net',
            'staging-swizec': 'd9wn1skltg0u7.cloudfront.net',
            production: 'd235oyylauiwpp.cloudfront.net',
            preproduction: 'dlb2dz5gp174o.cloudfront.net',
            scripts: 'd3ndbz27vmttup.cloudfront.net'
        };

        if (!this.inDevelopment()) {
            return "//"+CDNs[process.env.RAILS_ENV.toLowerCase()];
        }
        return "";
    }
};


var config = module.exports = {

    context: path.resolve(__dirname),

    entry: {
        src: './src/',
        babel_polyfill: 'babel-polyfill'
    },

    output: {
        filename: envConfig.inDevelopment()
            ? '[name].js'
            : '[name].[chunkhash].js',
        path: 'build/',
        publicPath: 'build/'
    },

    module: {

        rules: [

            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                exclude: [
                    path.resolve(__dirname, "node_modules/")
                ],
                query: {
                    plugins: ['transform-decorators-legacy',
                              'transform-runtime',
                              'transform-object-rest-spread',
                              'transform-react-constant-elements',
                              'transform-class-properties'],
                    presets: ['latest', 'react']
                },
                loader: 'babel-loader',
            },

            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                exclude: [
                    path.resolve(__dirname, "node_modules/")
                ],
                loader: 'eslint-loader',
            },

            {
                test: /\.(less|css)$/,
                use: [
                    ExtractTextPlugin.extract({
                        fallbackLoader: "style/useable",
                        loader: "style-loader"
                    }),
                    {
                        loader: 'css-loader?sourceMap',
                        query: {
                            modules: true,
                            importLoaders: 2
                        }
                    },
                    'postcss-loader?sourceMap',
                    'less-loader?sourceMap'
                ]
            },

            {
                test: /\.handlebars$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                loader: "handlebars-loader?helperDirs[]="+__dirname+"/app/assets/javascripts/helpers/handlebars"
            },


            {
                test: /\.(jpg|png|gif|svg)$/,
                loader: "file-loader"
            },

            {
                test: /\.(eot|ttf|woff|woff2|otf)$/,
                loader: "file-loader"
            }
        ]
    },
    plugins: [
        // Avoid publishing files when compilation failed:
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin( envConfig.inDevelopment() ?  "[name]_style.css" : "[name]_style.[chunkhash].css")
    ]

};


config.resolve = {
    extensions: ['.json', '.js', '.less', '.css', '.handlebars'],
    modules: [
        'node_modules',
        path.resolve(__dirname, 'src/')
    ]
};

//config.loaders = [];
config.externals = {};

[['jquery', 'jQuery'],
 ['jquery', '$'],
 ['lodash', '_'],
 ['backbone', 'Backbone'],
 ['handlebars', 'Handlebars'],
 ['moment', 'moment'],
 ['string', 'string'],
 ['async', 'async']
].forEach(([name, variable]) => {
    config.module.rules.push(
        {
            test: require.resolve(name),
            loader: 'expose-loader?'+variable
        }
    );
    config.externals[name] = 'var '+variable;
});

if ( envConfig.inProduction()) {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    );
    console.log('Webpack production build for Rails');
}
else {
    config.devtool= "#source-map";
    console.log('****Webpack development build for Rails, Env: ' +  envConfig.getStage());
}
