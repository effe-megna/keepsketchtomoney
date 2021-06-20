import Head from 'next/head'
import { AppProps } from 'next/app'
import '../styles/index.css'

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>KeepSketch - No-fluff money tracker</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
				<meta name='application-name' content='PWA App' />
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<meta name='apple-mobile-web-app-status-bar-style' content='default' />
				<meta name='apple-mobile-web-app-title' content='PWA App' />
				<meta name='description' content='Best PWA App in the world' />
				<meta name='format-detection' content='telephone=no' />
				<meta name='mobile-web-app-capable' content='yes' />
				<meta name='msapplication-config' content='/static/icons/browserconfig.xml' />
				<meta name='msapplication-TileColor' content='#2B5797' />
				<meta name='msapplication-tap-highlight' content='no' />
				<meta name='theme-color' content='#000000' />
			</Head>
			<Component {...pageProps} />
		</>
	)
}

export default MyApp