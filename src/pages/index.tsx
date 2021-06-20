import React from "react";
import moment from "moment"

type State = {
	records: Record[]
	portfolio: string
}

export default function Home() {
	const [state, setState] = useLocalStorage<State>('state', { records: [], portfolio: "0" })
	const [recordModal, setRecordModal] = React.useState<Record | 'init' | undefined>(undefined)
	const [portfolioModal, setPortfolioModal] = React.useState(false)

	console.log(state)

	const handleOnConfirm = (r: Record) => {
		setRecordModal(undefined)
		setState({ ...state, records: state.records.concat([r]) })
	}

	const handleOnPortfolioConfirm = (s: string) => {
		setPortfolioModal(false)
		setState({ ...state, portfolio: s })
	}

	const calculatePortfolioValue = () => {
		const prices = state.records.map(r => parseFloat(r.price))

		const value = prices.reduce((acc, curr) =>
			acc - curr
			, parseFloat(state.portfolio))

		return value < 0 ? 0 : value
	}

	const spendingThisMonth = (): number => {
		const currentMonth = moment().month()

		const recordFiltered = state.records.filter(r =>
			moment(r.created_at).month() === currentMonth
		)

		const prices = recordFiltered.map(r => r.price)

		return prices.reduce((acc, curr) => acc + parseFloat(curr), 0)
	}

	const currentMonthName = moment().format('MMMM')

	return (
		<div>
			<div className="w-full p-4 space-y-8">
				<div onClick={() => setPortfolioModal(true)}>
					<label className="leading-7 text-2xl text-indigo-400">Total portfolio</label>
					<p className="text-4xl mt-1 text-indigo-600">{`${calculatePortfolioValue()} €`}</p>
				</div>
				<div>
					<label className="leading-7 text-2xl text-indigo-400">{`Spending in ${currentMonthName}`}</label>
					<p className="text-4xl mt-1 text-indigo-600">{`${spendingThisMonth()} €`}</p>
				</div>
				<div>
					<label className="leading-7 text-xl text-gray-600">Records</label>
					<div className="flex flex-col w-full">
						{state.records.map((r, i) => (
							<div className="flex justify-between w-full" key={i}>
								<label className="leading-7 text-base text-gray-600">{`${r.price} €`}</label>
								<label className="leading-7 text-base text-gray-600">{r.category}</label>
							</div>
						))}
					</div>
				</div>
			</div>
			{recordModal && <RecordModal onConfirm={handleOnConfirm} onClose={() => setRecordModal(undefined)} />}
			{portfolioModal && <PortfolioModal value={state.portfolio} onClose={() => setPortfolioModal(false)} onConfirm={handleOnPortfolioConfirm} />}
			<button
				className="absolute bottom-4 right-4 text-white bg-indigo-500 border-0 p-4 focus:outline-none hover:bg-indigo-600 rounded-full"
				onClick={() => setRecordModal('init')}
			>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
			</button>
		</div>
	);
}

type Category = "FAST_FOOD" | "RESTAURANT" | "TRANSPORT"

type Record = {
	price: string
	category: Category
	created_at: Date
}

const RecordModal: React.FC<{ onConfirm: (r: Record) => void, onClose: () => void }> = ({
	onConfirm,
	onClose
}) => {
	const [price, setPrice] = React.useState<string>("0.0")
	const [category, setCategory] = React.useState<Category | undefined>("FAST_FOOD")

	const onConfirmHandler = () => {
		if (!category) return

		onConfirm({ price, category, created_at: new Date() })
	}

	return (
		<BaseModal onSubmit={onConfirmHandler} onClose={onClose}>
			<div>
				<Input label="Price" value={price} onTxtChange={setPrice} />
				<div className="flex flex-col space-y-2">
					<label className="leading-7 text-xl text-gray-600">Category</label>
					<div className="grid grid-cols-4">
						<PizzaCategory
							onClick={() => setCategory("FAST_FOOD")}
							active={category === "FAST_FOOD"}
						/>
						<RestaurantCategory
							onClick={() => setCategory("RESTAURANT")}
							active={category === "RESTAURANT"}
						/>
						<TransportCategory
							onClick={() => setCategory("TRANSPORT")}
							active={category === "TRANSPORT"}
						/>
					</div>
				</div>
			</div>
		</BaseModal>
	)
}

const PortfolioModal: React.FC<{ value: string, onConfirm: (s: string) => void, onClose: () => void }> = ({
	value,
	onConfirm,
	onClose
}) => {
	const [portfolioValue, setValue] = React.useState(value)

	return (
		<BaseModal
			onSubmit={() => onConfirm(portfolioValue)}
			onClose={onClose}
		>
			<Input
				label="Initial portfolio value"
				value={portfolioValue}
				onTxtChange={setValue}
			/>
		</BaseModal>
	)
}

const BaseModal: React.FC<{ onSubmit: () => void, onClose: () => void }> = ({
	onSubmit,
	onClose,
	children
}) => {

	return (
		<div className="bg-gray-100 h-auto absolute bottom-0 w-full z-10 p-4 space-y-4 flex flex-col justify-between">
			<div className="flex flex-row justify-end -mb-4" onClick={onClose}>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="lightgray">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
				</svg>
			</div>
			{children}
			<Button onClick={onSubmit}>
				Confirm
			</Button>
		</div>
	)
}

const Input: React.FC<{ label: string, value: string, onTxtChange: (s: string) => void }> = ({ label, value, onTxtChange }) => (
	<div className="space-y-2 mb-4">
		<label className="leading-7 text-xl text-gray-600">{label}</label>
		<input value={value} onChange={(evt) => onTxtChange(evt.currentTarget.value)} type="number" className="max-h-24 w-full bg-white rounded focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-2xl outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
	</div>
)

const Button: React.FC<{ onClick: () => void }> = ({
	children,
	onClick
}) => (
	<button
		onClick={onClick}
		className="bottom-4 right-4 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg font-bold"
	>
		{children}
	</button>
)

const IconButton: React.FC<{ active: boolean, onClick: () => void }> = ({
	children,
	onClick,
	active
}) => (
	<button
		onClick={onClick}
		className={`${active && 'border-4 border-indigo-400'} w-min right-4 text-white border-gray-700 p-4 focus:outline-none rounded-full`}
	>
		{children}
	</button>
)

const PizzaCategory: React.FC<{ active: boolean, onClick: () => void }> = ({
	active,
	onClick
}) => (
	<IconButton
		active={active}
		onClick={onClick}
	>
		<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M5.624 3.896c-.917-1.419-.036-3.774 2.084-3.895 1.001-.034 5.603.891 9.132 3.588 1.07.818 2.036 1.767 2.881 2.816 2.685 3.332 4.279 8.261 4.279 9.677 0 1.669-2.009 2.887-3.653 2.185l-20.347 5.733 5.624-20.104zm-2.737 17.212l16.145-4.547c-1.975-6.675-4.971-9.905-11.62-11.627l-4.525 16.174zm3.616-5.11c.83 0 1.502.674 1.502 1.501 0 .829-.672 1.501-1.502 1.501-.829 0-1.5-.672-1.5-1.501 0-.827.671-1.501 1.5-1.501m4.194-.972c.798.276 1.22 1.147.945 1.945-.276.798-1.148 1.22-1.945.945 0 0-.47-.166-.32-.599.149-.432.62-.268.62-.268.319.11.668-.059.778-.377.11-.32-.059-.668-.378-.78 0 0-.481-.127-.319-.594.147-.424.619-.272.619-.272m-3.04-12.094c7.157 1.773 11.111 5.485 13.315 13.068.211.726 1.276.356 1.111-.25-2.22-8.142-6.831-12.522-14.128-13.938-.641-.125-.941.961-.298 1.12m6.352 9.067c1.104 0 2 .897 2 2.001 0 1.105-.896 2-2 2-1.105 0-2.002-.895-2.002-2 0-1.104.897-2.001 2.002-2.001m-5.837 2.99c-.814-.192-1.32-1.009-1.128-1.822.193-.814 1.01-1.319 1.823-1.127 0 0 .48.116.377.558-.105.442-.584.327-.584.327-.327-.077-.653.125-.729.451-.078.325.124.652.449.729 0 0 .487.078.375.554-.103.433-.583.33-.583.33m1.834-7.581c1.104 0 2.001.897 2.001 2 0 1.104-.897 2-2.001 2-1.105 0-2.001-.896-2.001-2 0-1.103.896-2 2.001-2" /></svg>
	</IconButton>
)

const RestaurantCategory: React.FC<{ active: boolean, onClick: () => void }> = ({
	active,
	onClick
}) => (
	<IconButton
		active={active}
		onClick={onClick}
	>
		<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M19.188 0c-1.557 0-3.858 7.004-4.66 14h2.467v8.5c0 .931.785 1.5 1.5 1.5h.001c.828 0 1.5-.672 1.5-1.5.002-5.037.009-20.254-.001-21.649-.003-.494-.36-.851-.807-.851m-.191 1.333l-.001 21.167c0 .276-.225.5-.501.5-.157 0-.5-.126-.5-.5v-9.498h-2.334c.8-5.889 2.397-10.348 3.336-11.669m-8.443-1.333h-.887l.675 6.002-1.341-.002-.003-6h-1l.001 6h-1.003l.002-6h-1l-.005 6h-1.291l.597-5.998-.909-.002s-.611 5.038-.863 7.575c-.088.889.391 1.762 1.09 2.322.943.756 1.383.982 1.383 1.673v10.93c0 .828.666 1.5 1.497 1.5.832 0 1.504-.672 1.504-1.5v-10.925c0-.702.433-.918 1.382-1.669.713-.564 1.22-1.454 1.121-2.356-.275-2.545-.95-7.55-.95-7.55m-.117 7c.076.658.27 1.375-.674 2.122-.95.753-1.762 1.216-1.762 2.453v10.925c0 .276-.226.5-.504.5-.279 0-.497-.224-.497-.5v-10.93c0-1.222-.819-1.699-1.757-2.453-.911-.73-.719-1.475-.652-2.117h5.846z" fill="#030405" /></svg>
	</IconButton >
)

const TransportCategory: React.FC<{ active: boolean, onClick: () => void }> = ({
	active,
	onClick
}) => (
	<IconButton
		active={active}
		onClick={onClick}
	>
		<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M16 3h-8v-1h8v1zm4 10.228c-1.194.276-3.91.772-8 .772-4.091 0-6.807-.496-8-.772v-8.228h16v8.228zm.5-9.228h-17c-.276 0-.5.224-.5.5v9.5s3.098 1 9 1 9-1 9-1v-9.5c0-.276-.224-.5-.5-.5zm-5.5 14.5c0 .276-.224.5-.5.5h-5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h5c.276 0 .5.224.5.5zm4 .5c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1zm0-3c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm-14 3c-.551 0-1-.448-1-1s.449-1 1-1c.551 0 1 .448 1 1s-.449 1-1 1zm0-3c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm18-5h-1v9c0 .621-.52 1-1 1h-18c-.617 0-1-.516-1-1v-9h-1v-3h1v-5c0-1.103.897-2 2-2h16c1.103 0 2 .897 2 2v5h1v3zm-3 12h-2v-1h2v1zm-14 0h-2v-1h2v1zm17-16v-4c0-1.657-1.343-3-3-3h-16c-1.657 0-3 1.343-3 3v4c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1v8c0 1.239 1.037 2 2 2v1c0 .552.448 1 1 1h2c.552 0 1-.448 1-1v-1h10v1c0 .552.448 1 1 1h2c.552 0 1-.448 1-1v-1c.958 0 2-.758 2-2v-8c.552 0 1-.448 1-1v-3c0-.552-.448-1-1-1z" /></svg>
	</IconButton>
)





















//https://usehooks.com/useLocalStorage/

// Hook
function useLocalStorage<T>(key: string, initialValue: T) {
	// State to store our value
	// Pass initial state function to useState so logic is only executed once
	const [storedValue, setStoredValue] = React.useState<T>(() => {
		try {
			// Get from local storage by key
			const item = window.localStorage.getItem(key);
			// Parse stored json or if none return initialValue
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			// If error also return initialValue
			console.log(error);
			return initialValue;
		}
	});
	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to localStorage.
	const setValue = (value: T | ((val: T) => T)) => {
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			// Save state
			setStoredValue(valueToStore);
			// Save to local storage
			window.localStorage.setItem(key, JSON.stringify(valueToStore));
		} catch (error) {
			// A more advanced implementation would handle the error case
			console.log(error);
		}
	};
	return [storedValue, setValue] as const;
}