import React from "react";
import moment from "moment"

type State = {
	records: Record[]
	portfolio: string
	budget: Budget | undefined
}

type Category = "FAST_FOOD" | "RESTAURANT" | "TRANSPORT" | "BILLS" | "HOUSE RENTAL"

type Record = {
	price: string
	category: Category
	created_at: Date
}

type Budget = {
	name: string
	value: string
}

export default function Home() {
	const [state, setState] = useLocalStorage<State>('state', { records: [], portfolio: "0", budget: undefined })
	const [recordModal, setRecordModal] = React.useState<Record | 'init' | undefined>(undefined)
	const [portfolioModal, setPortfolioModal] = React.useState(false)
	const [budgetModal, setBudgetModal] = React.useState(false)

	const handleOnConfirm = (r: Record) => {
		setRecordModal(undefined)
		setState({ ...state, records: state.records.concat([r]) })
	}

	const handleOnPortfolioConfirm = (s: string) => {
		setPortfolioModal(false)
		setState({ ...state, portfolio: s })
	}

	const handleOnBudgetConfirm = (b: Budget) => {
		setBudgetModal(false)
		setState({ ...state, budget: b })
	}

	const calculatePortfolioValue = () => {
		const prices = state.records.map(r => parseFloat(r.price))

		const value = prices.reduce((acc, curr) =>
			acc - curr
			, parseFloat(state.portfolio))

		return value < 0 ? 0 : value
	}

	const getMonthlyRecords = (): Record[] => {
		const currentMonth = moment().month()

		return state.records.filter(r =>
			moment(r.created_at).month() === currentMonth
		)
	}

	const spendingThisMonth = (): number => {
		const prices = getMonthlyRecords().map(r => r.price)

		return prices.reduce((acc, curr) => acc + parseFloat(curr), 0)
	}

	const calculateBudgetData = (): { left: string, percentage: string, widthClassname: string, percentageColor: string } => {
		const budget = state.budget

		if (!budget) return

		const spending = spendingThisMonth()

		const difference = spending - parseFloat(budget.value)

		const absDiffrence = Math.abs(difference)

		const percentage = (spending / parseFloat(budget.value) * 100)

		const spendingIsOverBudget = percentage > 100

		return {
			left: spendingIsOverBudget ? `- ${absDiffrence}` : absDiffrence.toString(),
			percentage: `${percentage.toFixed(1)} %`,
			widthClassname: fromPercentageToWidthClassname(percentage),
			percentageColor: spendingIsOverBudget ? 'text-red-500' : 'text-gray-500'
		}
	}

	const currentMonthName = moment().format('MMMM')

	return (
		<div>
			<div className="w-full p-4 space-y-8">
				<div className="cursor-pointer" onClick={() => setPortfolioModal(true)}>
					<label className="leading-7 text-2xl text-indigo-400">Total portfolio</label>
					<p className="text-4xl mt-1 text-indigo-600">{`${calculatePortfolioValue()} €`}</p>
				</div>
				<div>
					<label className="leading-7 text-2xl text-indigo-400">{`Spending in ${currentMonthName}`}</label>
					<p className="text-4xl mt-1 text-indigo-600">{`${spendingThisMonth()} €`}</p>
				</div>
				<div>
					{state.budget ? (
						<>
							<Label>
								{`Budget for ${state.budget.name}`}
							</Label>
							<div className="flex flex-col mt-2">
								<div className="flex justify-between items-center mx-2">
									<p className={`relative ${calculateBudgetData().percentageColor} text-sm`}>{calculateBudgetData().percentage}</p>
									<p className={`${calculateBudgetData().percentageColor} text-base`}>{`${calculateBudgetData().left} €`}</p>
								</div>
								<div className="bg-gray-300 rounded-full">
									<div
										className={`${calculateBudgetData().widthClassname} h-4 bg-indigo-600 rounded-full`}
									/>
								</div>
							</div>
						</>
					) : (
						<div className="cursor-pointer" onClick={() => setBudgetModal(true)}>
							<Label>
								Add budget
							</Label>
						</div>
					)}
				</div>
				<div>
					{state.records.length > 0 && <label className="leading-7 text-xl text-gray-600">Records</label>}
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
			{budgetModal && <BudgetModal onConfirm={handleOnBudgetConfirm} onClose={() => setBudgetModal(false)} />}
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

const Label: React.FC = ({
	children
}) => (
	<label className="leading-7 text-2xl text-indigo-400">{children}</label>
)

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
				<Input label="Price" value={price} onTxtChange={setPrice} type="number"/>
				<div className="flex flex-col space-y-2">
					<label className="leading-7 text-xl text-gray-600">Category</label>
					<div className="flex flex-col">
						<CategoryRow label="FAST FOOD" onClick={() => setCategory("FAST_FOOD")}>
							<PizzaCategory
								onClick={() => setCategory("FAST_FOOD")}
								active={category === "FAST_FOOD"}
							/>
						</CategoryRow>
						<CategoryRow label="RESTAURANT" onClick={() => setCategory("RESTAURANT")}>
							<RestaurantCategory
								onClick={() => setCategory("RESTAURANT")}
								active={category === "RESTAURANT"}
							/>
						</CategoryRow>
						<CategoryRow label="TRANSPORT" onClick={() => setCategory("TRANSPORT")}>
							<TransportCategory
								onClick={() => setCategory("TRANSPORT")}
								active={category === "TRANSPORT"}
							/>
						</CategoryRow>
						<CategoryRow label="HOUSE RENTAL" onClick={() => setCategory("HOUSE RENTAL")}>
							<HouseRentalCategory
								onClick={() => setCategory("HOUSE RENTAL")}
								active={category === "HOUSE RENTAL"}
							/>
						</CategoryRow>
						<CategoryRow label="BILLS" onClick={() => setCategory("BILLS")}>
							<BillsCategory
								onClick={() => setCategory("BILLS")}
								active={category === "BILLS"}
							/>
						</CategoryRow>
					</div>
				</div>
			</div>
		</BaseModal>
	)
}

const CategoryRow: React.FC<{ label: string, onClick: () => void }> = ({
	label,
	onClick,
	children
}) => (
	<div onClick={onClick} className="flex flex-row space-x-4 items-center">
		{children}
		<label className="leading-7 text-base text-gray-600">{label}</label>
	</div>
)

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
				type="number"
				onTxtChange={setValue}
			/>
		</BaseModal>
	)
}

const BudgetModal: React.FC<{ onConfirm: (b: Budget) => void, onClose: () => void }> = ({
	onConfirm,
	onClose
}) => {
	const [value, setValue] = React.useState("0.0")
	const [name, setName] = React.useState("")

	const onConfirmHandler = () => {
		if ((value && parseInt(value) === 0) || !name) return

		onConfirm({ value, name })		
	}

	return (
		<BaseModal
			onSubmit={onConfirmHandler}
			onClose={onClose}
		>
			<Input
				label="What this budget is for?"
				value={name}
				type="text"
				onTxtChange={setName}
			/>
			<Input
				label="How much do you want to spend this month?"
				value={value}
				type="number"
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
			<div className="flex flex-row justify-end -mb-4 cursor-pointer" onClick={onClose}>
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

const Input: React.FC<{ type: string, label: string, value: string, onTxtChange: (s: string) => void }> = ({ type, label, value, onTxtChange }) => (
	<div className="space-y-2 mb-4">
		<label className="leading-7 text-xl text-gray-600">{label}</label>
		<input value={value} onChange={(evt) => onTxtChange(evt.currentTarget.value)} type={type} className="max-h-24 w-full bg-white rounded focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-2xl outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
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

const HouseRentalCategory: React.FC<{ active: boolean, onClick: () => void }> = ({
	active,
	onClick
}) => (
	<IconButton
		active={active}
		onClick={onClick}
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20 7.093v-5.093h-3v2.093l3 3zm4 5.907l-12-12-12 12h3v10h7v-5h4v5h7v-10h3zm-5 8h-3v-5h-8v5h-3v-10.26l7-6.912 7 6.99v10.182z" /></svg>
	</IconButton>
)

const BillsCategory: React.FC<{ active: boolean, onClick: () => void }> = ({
	active,
	onClick
}) => (
	<IconButton
		active={active}
		onClick={onClick}
	>
		<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
			width="24" height="24" viewBox="0 0 492.000000 503.000000"
			preserveAspectRatio="xMidYMid meet">
			<g transform="translate(0.000000,503.000000) scale(0.100000,-0.100000)"
				fill="#000000" stroke="none">
				<path d="M1040 4869 c-60 -24 -70 -70 -135 -584 -14 -115 -36 -286 -50 -380
-13 -93 -26 -199 -30 -235 -3 -36 -12 -103 -20 -150 -7 -47 -18 -128 -25 -180
-6 -52 -25 -187 -40 -300 -16 -113 -36 -261 -45 -330 -9 -69 -22 -165 -30
-215 -14 -89 -44 -300 -85 -605 -11 -85 -25 -182 -30 -215 -5 -33 -21 -152
-36 -265 -14 -113 -30 -230 -34 -260 -49 -357 -62 -493 -51 -529 20 -67 44
-75 306 -106 77 -9 174 -23 215 -30 65 -12 342 -48 465 -61 34 -3 311 -40 555
-74 123 -17 225 -31 340 -45 63 -8 160 -21 215 -30 55 -9 133 -20 173 -25 326
-44 345 -46 462 -64 58 -8 123 -17 145 -20 22 -3 72 -9 110 -14 323 -45 324
-45 354 -32 47 19 79 75 91 160 13 90 31 277 36 380 2 41 6 84 9 95 7 24 33
192 46 295 5 41 25 188 44 325 41 298 43 309 61 450 7 61 18 139 24 175 18
114 19 122 39 280 12 85 25 189 31 230 6 41 17 131 26 200 8 69 17 136 18 150
25 179 36 263 41 305 3 28 10 73 15 100 5 28 14 93 20 145 17 155 29 247 49
400 11 80 23 172 26 205 4 33 13 106 21 161 23 162 20 196 -18 237 -30 31 -42
35 -118 47 -47 7 -101 14 -120 16 -19 2 -80 11 -135 19 -55 8 -113 17 -130 20
-16 2 -68 9 -115 15 -47 6 -112 15 -145 20 -70 10 -205 29 -255 35 -94 10
-435 57 -620 84 -74 11 -243 34 -375 51 -132 17 -267 35 -300 41 -33 5 -179
25 -325 44 -146 19 -314 41 -375 49 -161 21 -266 27 -295 15z m315 -269 c114
-16 300 -39 352 -44 28 -3 80 -10 115 -16 34 -6 140 -20 233 -31 237 -28 380
-47 450 -58 33 -6 80 -11 105 -12 25 -1 49 -4 54 -7 4 -2 27 -6 50 -9 22 -2
55 -5 71 -8 17 -2 66 -9 110 -15 44 -6 94 -14 110 -16 72 -11 103 -15 155 -20
79 -7 94 -9 105 -16 6 -3 42 -9 80 -12 39 -4 84 -9 100 -11 17 -3 50 -7 75
-10 25 -3 90 -12 145 -20 55 -9 120 -18 145 -21 25 -2 70 -9 100 -15 30 -6 64
-12 75 -14 78 -10 121 -19 127 -29 5 -6 6 -29 3 -51 -16 -136 -27 -228 -45
-367 -53 -416 -61 -475 -65 -503 -3 -16 -14 -104 -25 -195 -22 -181 -64 -498
-80 -600 -5 -36 -14 -101 -20 -145 -10 -89 -35 -266 -50 -365 -5 -36 -17 -121
-25 -190 -9 -69 -25 -188 -36 -265 -18 -134 -26 -193 -49 -378 -6 -45 -15
-113 -21 -152 -9 -68 -38 -288 -60 -450 -23 -180 -20 -170 -59 -168 -19 1
-120 14 -225 28 -104 15 -305 41 -445 60 -140 18 -309 41 -375 50 -66 9 -140
18 -165 20 -25 3 -56 7 -70 10 -14 3 -45 7 -70 10 -25 3 -103 14 -175 24 -71
11 -204 29 -295 41 -91 12 -239 32 -330 45 -91 13 -194 27 -229 30 -35 3 -67
7 -70 10 -4 2 -36 6 -71 10 -36 4 -132 16 -215 28 l-150 22 -3 45 c-2 25 2 79
8 120 7 41 14 93 17 115 2 22 6 51 8 65 2 14 15 108 28 210 14 102 44 313 66
470 39 272 61 428 116 820 14 96 30 204 35 240 6 36 15 101 20 145 5 44 12 96
15 115 3 19 10 73 16 120 5 47 18 144 29 215 10 72 26 195 35 275 9 80 23 183
30 230 8 47 23 166 35 265 11 99 25 216 32 260 6 44 13 91 14 105 1 14 2 27 3
29 0 2 22 1 49 -3 26 -4 74 -11 107 -16z"/>
				<path d="M1284 4264 c-17 -25 -17 -26 19 -59 31 -29 37 -41 37 -75 0 -82 -59
-421 -80 -461 -6 -10 -24 -26 -40 -34 -34 -18 -39 -44 -12 -68 17 -16 48 -22
257 -48 50 -6 131 -17 180 -23 73 -10 100 -9 145 2 30 8 60 18 67 24 7 5 17 6
24 2 7 -4 10 -2 7 7 -3 8 4 18 15 24 24 12 71 99 75 138 5 40 -32 109 -78 146
-22 18 -40 39 -40 48 0 9 20 38 45 64 25 26 46 56 46 66 1 10 3 29 5 43 5 42
-16 88 -49 112 -18 12 -38 28 -45 34 -16 16 -91 31 -217 44 -55 5 -138 16
-185 25 -125 22 -156 20 -176 -11z m391 -127 c32 -27 43 -88 25 -141 -16 -49
-35 -66 -74 -66 -58 0 -61 14 -40 170 9 65 41 79 89 37z m-36 -311 c33 -18 51
-54 51 -106 0 -77 -30 -119 -86 -120 -54 0 -67 26 -61 122 2 46 8 91 12 101 9
21 46 22 84 3z"/>
				<path d="M2180 4169 c-30 -3 -63 -9 -72 -13 -23 -10 -24 -64 -3 -73 9 -3 23
-19 31 -36 17 -32 15 -146 -6 -267 -5 -30 -11 -75 -14 -100 -10 -80 -38 -142
-68 -152 -22 -8 -28 -16 -28 -39 0 -25 6 -33 35 -44 76 -33 281 -47 333 -25
41 19 41 42 0 83 -39 39 -39 60 -9 297 6 47 15 103 20 125 5 22 12 55 16 72 6
28 35 68 35 49 0 -4 13 0 29 9 35 18 32 44 -8 68 -55 32 -202 56 -291 46z"/>
				<path d="M2588 4099 c-46 -17 -47 -62 -1 -80 44 -16 50 -53 37 -208 -16 -173
-41 -323 -57 -334 -7 -5 -27 -15 -44 -23 -24 -10 -33 -21 -33 -38 0 -30 4 -32
165 -51 203 -23 373 -52 391 -66 16 -12 89 53 104 93 6 18 17 43 22 54 11 24
3 60 -20 87 -24 27 -37 21 -66 -33 -31 -57 -50 -70 -115 -77 -57 -5 -117 18
-127 49 -7 23 -7 104 0 148 2 14 7 54 10 90 11 106 37 254 47 265 6 5 15 10
22 11 33 3 57 18 57 36 0 53 -297 111 -392 77z"/>
				<path d="M3298 3997 c-40 -16 -37 -50 7 -75 19 -12 37 -32 41 -47 3 -14 -1
-98 -10 -188 -30 -284 -40 -320 -95 -332 -32 -7 -51 -39 -33 -57 10 -10 142
-29 153 -22 4 2 10 0 14 -6 3 -5 31 -10 61 -10 30 0 54 -4 54 -10 0 -5 20 -10
45 -10 25 0 86 -9 136 -20 50 -11 101 -18 112 -14 44 14 107 115 107 172 0 31
-29 72 -50 72 -6 0 -22 -22 -38 -50 -33 -61 -59 -75 -132 -74 -65 1 -105 22
-115 61 -7 31 2 142 24 288 6 39 12 93 14 121 3 57 16 75 70 95 50 18 49 43
-4 69 -80 41 -295 63 -361 37z"/>
				<path d="M1371 3092 c-19 -35 19 -54 54 -28 16 12 17 16 6 30 -18 21 -48 20
-60 -2z"/>
				<path d="M1521 3077 c-15 -18 -4 -47 18 -47 26 0 43 16 39 36 -4 23 -40 30
-57 11z"/>
				<path d="M1667 3056 c-9 -23 2 -46 22 -46 26 0 43 16 39 36 -4 24 -53 32 -61
10z"/>
				<path d="M1814 3028 c-9 -30 20 -52 47 -35 22 14 24 28 7 45 -19 19 -46 14
-54 -10z"/>
				<path d="M1964 3015 c-9 -23 3 -45 25 -45 26 0 45 32 29 48 -17 17 -48 15 -54
-3z"/>
				<path d="M2117 3003 c-4 -3 -7 -17 -7 -30 0 -18 6 -23 24 -23 25 0 43 30 31
50 -7 11 -38 13 -48 3z"/>
				<path d="M2262 2977 c-18 -22 11 -56 35 -41 25 15 23 48 -3 52 -11 2 -26 -3
-32 -11z"/>
				<path d="M2410 2955 c-15 -18 -6 -45 13 -45 20 0 40 27 33 45 -7 19 -30 19
-46 0z"/>
				<path d="M2550 2920 c0 -23 5 -30 19 -30 24 0 45 25 37 45 -3 8 -17 15 -31 15
-21 0 -25 -5 -25 -30z"/>
				<path d="M2704 2915 c-8 -21 2 -45 19 -45 8 0 20 7 27 15 10 12 10 18 0 30 -7
8 -19 15 -27 15 -7 0 -16 -7 -19 -15z"/>
				<path d="M2845 2890 c-8 -25 1 -40 23 -40 33 0 45 15 33 39 -15 27 -48 27 -56
1z"/>
				<path d="M2995 2869 c-5 -14 -2 -25 6 -30 24 -15 44 -5 44 21 0 34 -40 41 -50
9z"/>
				<path d="M3141 2852 c-13 -24 3 -42 37 -42 20 0 23 4 20 28 -4 34 -41 43 -57
14z"/>
				<path d="M3286 2834 c-7 -19 10 -44 29 -44 19 0 36 25 29 44 -3 9 -16 16 -29
16 -13 0 -26 -7 -29 -16z"/>
				<path d="M3437 2824 c-10 -11 -9 -42 3 -49 20 -12 51 6 48 28 -3 22 -36 35
-51 21z"/>
				<path d="M1344 2806 c-10 -26 4 -46 31 -46 23 0 26 4 23 28 -3 31 -44 45 -54
18z"/>
				<path d="M1496 2787 c-25 -19 -10 -49 23 -45 29 3 42 35 19 49 -17 12 -21 11
-42 -4z"/>
				<path d="M1641 2766 c-6 -7 -9 -21 -5 -30 9 -23 56 -16 60 9 5 32 -34 47 -55
21z"/>
				<path d="M1784 2745 c-9 -23 3 -45 24 -45 29 0 48 26 32 45 -7 8 -21 15 -32
15 -10 0 -21 -7 -24 -15z"/>
				<path d="M1934 2725 c-4 -8 -3 -22 0 -31 8 -21 50 -14 54 10 6 31 -43 50 -54
21z"/>
				<path d="M2092 2711 c-20 -12 -10 -46 12 -46 27 0 46 33 26 45 -18 12 -21 12
-38 1z"/>
				<path d="M2231 2678 c-11 -28 -6 -38 18 -38 28 0 46 26 31 45 -18 22 -39 18
-49 -7z"/>
				<path d="M2382 2671 c-20 -12 -10 -45 14 -49 29 -4 51 23 34 43 -14 17 -29 19
-48 6z"/>
				<path d="M2525 2640 c-8 -26 6 -43 31 -38 13 2 19 12 19 28 0 34 -40 41 -50
10z"/>
				<path d="M2671 2622 c-14 -27 2 -46 33 -38 28 7 33 25 14 44 -17 17 -36 15
-47 -6z"/>
				<path d="M2820 2605 c-7 -8 -10 -22 -6 -30 7 -20 40 -19 57 1 11 14 10 18 -6
30 -24 18 -30 18 -45 -1z"/>
				<path d="M2972 2591 c-21 -13 -10 -46 16 -47 12 -1 22 5 22 12 0 8 5 14 11 14
8 0 8 5 -1 15 -14 17 -29 19 -48 6z"/>
				<path d="M3117 2573 c-4 -3 -7 -17 -7 -30 0 -18 5 -23 25 -23 33 0 45 28 20
46 -21 16 -29 17 -38 7z"/>
				<path d="M3260 2545 c-15 -18 -6 -45 14 -45 45 0 61 31 27 50 -25 13 -26 13
-41 -5z"/>
				<path d="M3410 2530 c-7 -4 -10 -16 -8 -26 5 -28 52 -26 56 2 3 23 -26 38 -48
24z"/>
				<path d="M1312 2513 c-13 -26 -4 -43 23 -43 32 0 52 25 35 45 -17 20 -47 19
-58 -2z"/>
				<path d="M1461 2497 c-15 -18 -4 -47 18 -47 26 0 43 16 39 36 -4 23 -40 30
-57 11z"/>
				<path d="M1612 2478 c-21 -21 -14 -48 12 -48 29 0 49 22 40 44 -7 19 -35 21
-52 4z"/>
				<path d="M1754 2455 c-9 -23 3 -45 24 -45 29 0 48 26 32 45 -7 8 -21 15 -32
15 -10 0 -21 -7 -24 -15z"/>
				<path d="M1912 2441 c-23 -14 -10 -46 18 -46 20 0 25 5 25 25 0 26 -20 36 -43
21z"/>
				<path d="M2052 2413 c-12 -24 -4 -43 18 -43 23 0 44 26 36 45 -7 21 -43 19
-54 -2z"/>
				<path d="M2200 2395 c-16 -19 -6 -45 18 -45 29 0 48 26 32 45 -16 19 -34 19
-50 0z"/>
				<path d="M2352 2381 c-23 -14 -10 -46 18 -46 20 0 25 5 25 25 0 26 -20 36 -43
21z"/>
				<path d="M2497 2363 c-10 -10 -8 -41 3 -48 17 -11 50 5 50 25 0 23 -37 40 -53
23z"/>
				<path d="M2636 2334 c-7 -19 10 -44 29 -44 7 0 18 7 25 15 10 12 10 18 0 30
-16 20 -46 19 -54 -1z"/>
				<path d="M2790 2315 c-15 -18 -6 -45 14 -45 8 0 22 7 31 16 12 12 13 19 4 30
-15 18 -33 18 -49 -1z"/>
				<path d="M2936 2294 c-12 -31 -7 -45 15 -42 31 4 49 35 29 48 -22 14 -37 12
-44 -6z"/>
				<path d="M3084 2275 c-7 -17 2 -45 13 -45 4 0 17 7 27 15 16 12 17 17 6 30
-16 19 -39 19 -46 0z"/>
				<path d="M3226 2255 c-9 -25 5 -46 28 -43 15 2 22 11 24 31 3 23 0 27 -21 27
-14 0 -27 -7 -31 -15z"/>
				<path d="M3375 2230 c-8 -25 1 -40 25 -40 10 0 22 5 25 10 11 17 -6 50 -25 50
-10 0 -21 -9 -25 -20z"/>
				<path d="M1277 2226 c-11 -28 4 -47 32 -44 20 2 26 8 26 28 0 20 -6 26 -26 28
-17 2 -29 -3 -32 -12z"/>
				<path d="M1427 2214 c-13 -13 -7 -43 11 -53 26 -14 60 13 46 37 -12 18 -45 28
-57 16z"/>
				<path d="M1574 2185 c-9 -23 3 -45 24 -45 29 0 48 26 32 45 -7 8 -21 15 -32
15 -10 0 -21 -7 -24 -15z"/>
				<path d="M1724 2166 c-10 -26 4 -48 28 -44 17 2 23 10 23 28 0 18 -6 26 -23
28 -13 2 -25 -3 -28 -12z"/>
				<path d="M1871 2142 c-12 -22 3 -42 30 -42 23 0 32 15 24 40 -8 25 -41 26 -54
2z"/>
				<path d="M2022 2131 c-20 -12 -10 -45 14 -49 29 -4 51 23 34 43 -14 17 -29 19
-48 6z"/>
				<path d="M2165 2100 c-8 -26 1 -40 26 -37 31 5 44 23 29 42 -18 21 -47 19 -55
-5z"/>
				<path d="M2314 2086 c-10 -26 4 -48 28 -44 17 2 23 10 23 28 0 18 -6 26 -23
28 -13 2 -25 -3 -28 -12z"/>
				<path d="M2461 2061 c-13 -23 10 -47 34 -37 22 8 30 36 14 47 -22 14 -37 11
-48 -10z"/>
				<path d="M2606 2045 c-8 -22 4 -45 24 -45 10 0 23 7 30 15 15 18 -2 45 -30 45
-10 0 -20 -7 -24 -15z"/>
				<path d="M2755 2020 c-8 -25 1 -40 24 -40 28 0 46 26 31 45 -18 21 -48 19 -55
-5z"/>
				<path d="M2904 2005 c-8 -21 2 -45 19 -45 20 0 40 27 33 45 -7 19 -45 20 -52
0z"/>
				<path d="M3057 1987 c-37 -26 4 -62 43 -37 11 7 12 14 4 27 -14 23 -27 26 -47
10z"/>
				<path d="M3200 1965 c-28 -34 15 -61 47 -30 12 12 13 19 3 30 -16 19 -34 19
-50 0z"/>
				<path d="M3344 1945 c-9 -23 3 -45 25 -45 24 0 39 39 20 51 -21 13 -39 11 -45
-6z"/>
				<path d="M1247 1944 c-11 -12 -8 -41 6 -52 7 -6 21 -6 35 -1 33 12 27 53 -8
57 -14 2 -29 0 -33 -4z"/>
				<path d="M1395 1910 c-9 -27 1 -40 30 -40 30 0 39 14 25 40 -14 26 -47 26 -55
0z"/>
				<path d="M1544 1895 c-9 -23 3 -45 24 -45 28 0 43 20 31 42 -12 22 -47 24 -55
3z"/>
				<path d="M1687 1876 c-9 -23 2 -46 22 -46 26 0 43 16 39 36 -4 24 -53 32 -61
10z"/>
				<path d="M1836 1855 c-7 -20 3 -45 19 -45 26 0 45 13 45 30 0 29 -53 42 -64
15z"/>
				<path d="M1987 1843 c-13 -13 -7 -42 12 -52 25 -14 54 16 40 42 -10 17 -40 23
-52 10z"/>
				<path d="M2137 1823 c-13 -12 -7 -44 8 -50 23 -8 58 26 44 44 -12 14 -41 18
-52 6z"/>
				<path d="M2280 1785 c0 -31 26 -43 47 -22 21 21 9 47 -22 47 -20 0 -25 -5 -25
-25z"/>
				<path d="M2430 1775 c-10 -12 -10 -18 0 -30 7 -8 17 -15 22 -15 18 0 38 28 32
44 -8 20 -38 21 -54 1z"/>
				<path d="M2575 1750 c-8 -25 1 -40 24 -40 28 0 46 26 31 45 -18 21 -48 19 -55
-5z"/>
				<path d="M2727 1744 c-10 -10 -9 -42 1 -48 5 -3 19 -2 31 1 15 4 21 12 19 27
-3 21 -37 34 -51 20z"/>
				<path d="M2872 1713 c-13 -26 -4 -43 23 -43 24 0 42 30 30 50 -10 16 -44 12
-53 -7z"/>
				<path d="M3020 1695 c-16 -19 -6 -45 18 -45 29 0 48 26 32 45 -16 19 -34 19
-50 0z"/>
				<path d="M3164 1675 c-10 -25 4 -45 30 -45 26 0 36 14 28 43 -5 21 -50 23 -58
2z"/>
				<path d="M3312 1658 c-14 -14 2 -48 22 -48 20 0 37 25 30 44 -7 19 -35 21 -52
4z"/>
				<path d="M2294 1236 c-3 -8 -23 -17 -43 -21 -40 -7 -72 -39 -84 -84 -8 -32 16
-87 45 -101 12 -7 33 -22 46 -33 12 -11 22 -17 22 -13 0 4 9 2 20 -4 25 -13
28 -68 4 -77 -19 -7 -36 15 -30 39 2 10 1 20 -3 22 -4 3 -8 -7 -9 -22 -3 -36
-19 -43 -65 -25 -34 14 -40 14 -53 1 -8 -8 -12 -22 -8 -31 7 -20 88 -52 104
-42 9 5 10 1 6 -16 l-6 -24 11 23 c7 12 17 22 23 23 44 3 59 8 80 28 29 28 41
84 26 121 -6 15 -27 36 -46 46 -19 10 -37 27 -40 37 -4 14 -9 15 -19 7 -11 -9
-17 -6 -30 14 -25 37 -12 46 58 42 98 -6 125 25 51 60 -19 9 -34 23 -34 30 0
18 -19 18 -26 0z"/>
				<path d="M2485 1171 c-4 -12 3 -35 17 -58 13 -21 31 -55 41 -76 l17 -37 -37
-43 c-21 -23 -53 -57 -71 -74 -21 -20 -32 -39 -28 -48 6 -17 26 -21 26 -5 0 5
4 9 9 7 5 -1 30 19 55 46 25 26 54 47 65 47 13 0 32 -22 60 -70 39 -65 44 -70
69 -64 37 9 37 9 13 40 -11 15 -21 30 -21 35 0 4 -13 30 -28 56 -33 56 -45 93
-29 90 6 -1 16 8 22 21 5 12 13 22 16 22 4 0 22 15 41 34 25 25 32 39 26 50
-15 26 -34 19 -79 -29 -23 -25 -47 -45 -53 -45 -10 0 -26 21 -70 93 -19 31
-52 36 -61 8z"/>
				<path d="M2837 1139 c-22 -13 -14 -46 25 -110 36 -59 35 -82 -2 -122 -16 -18
-30 -39 -30 -47 0 -13 -1 -13 -10 0 -8 12 -12 9 -22 -17 -6 -17 -20 -34 -31
-37 -23 -6 -13 -26 12 -26 21 0 74 53 64 65 -5 4 -1 6 9 2 11 -4 18 1 22 16 8
35 50 33 75 -2 12 -16 21 -33 21 -38 0 -4 11 -25 25 -46 20 -28 32 -37 55 -37
29 0 48 14 31 24 -10 7 -69 106 -89 150 -17 40 -6 83 26 104 50 31 75 60 69
76 -12 31 -50 17 -86 -30 -19 -25 -41 -44 -49 -42 -9 2 -27 24 -42 51 -35 64
-51 78 -73 66z"/>
				<path d="M3164 1083 c-8 -13 -2 -32 28 -89 21 -39 38 -79 38 -87 0 -8 -18 -34
-40 -56 -22 -22 -40 -44 -40 -48 0 -5 -10 -13 -22 -18 -26 -11 -36 -44 -17
-55 16 -10 48 10 42 26 -2 7 14 25 36 40 23 15 41 33 41 41 0 10 6 13 17 9 9
-4 20 -1 24 6 5 8 10 2 15 -18 5 -22 53 -119 70 -142 1 -2 11 -1 21 2 29 9 22
49 -20 122 -7 12 -18 29 -25 37 -18 21 -23 109 -6 103 7 -3 15 2 18 10 3 8 11
14 17 14 18 0 59 49 59 71 0 34 -32 21 -82 -33 -41 -47 -49 -51 -61 -38 -11
11 -60 96 -62 106 0 1 -9 4 -20 8 -13 4 -24 0 -31 -11z"/>
			</g>
		</svg>
	</IconButton>
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













const fromPercentageToWidthClassname = (n: number) => {
	const baseValue = 8.3

	if (n === 0) {
		return 'w-0'
	}

	if (n <= baseValue) {
		return 'w-1/12'
	} else if (n <= (baseValue * 2)) {
		return 'w-2/12'
	} else if (n <= (baseValue * 3)) {
		return 'w-3/12'
	} else if (n <= (baseValue * 4)) {
		return 'w-4/12'
	} else if (n <= (baseValue * 5)) {
		return 'w-5/12'
	} else if (n <= (baseValue * 6)) {
		return 'w-6/12'
	} else if (n <= (baseValue * 7)) {
		return 'w-7/12'
	} else if (n <= (baseValue * 8)) {
		return 'w-8/12'
	} else if (n <= (baseValue * 9)) {
		return 'w-9/12'
	} else if (n <= (baseValue * 10)) {
		return 'w-10/12'
	} else if (n <= (baseValue * 11)) {
		return 'w-11/12'
	} else {
		return "w-full"
	}
}







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