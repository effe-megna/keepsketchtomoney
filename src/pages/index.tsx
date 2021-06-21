import React from "react";
import moment from "moment"

type State = {
	records: Record[]
	portfolio: string
	budget: Budget | undefined
}

type Category = "FAST_FOOD" | "RESTAURANT" | "TRANSPORT" | "BILLS" | "HOUSE RENTAL" | 'FOOD_AND_DRINKS' | 'GYM_AND_FITNESS'

type Record = {
	price: string
	category: Category
	created_at: Date
}

type Budget = {
	name: string
	value: string
	categoriesIncluded: Category[]
}

export default function Home() {
	const [state, setState] = useLocalStorage<State>('state', { records: [], portfolio: "0", budget: undefined })
	const [recordModal, setRecordModal] = React.useState<Record | 'init' | undefined>(undefined)
	const [portfolioModal, setPortfolioModal] = React.useState(false)
	const [budgetModal, setBudgetModal] = React.useState(false)
	const [menuModal, setMenuModal] = React.useState(false)

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

	const spendingThisMonth = (includeCategories?: Category[]): number => {
		const prices = (() => {
			if (includeCategories) {
				return getMonthlyRecords().filter(r => includeCategories.includes(r.category)).map(r => r.price)
			} else {
				return getMonthlyRecords().map(r => r.price)
			}
		})()

		return prices.reduce((acc, curr) => acc + parseFloat(curr), 0)
	}

	const calculateBudgetData = (): { left: string, percentage: string, widthClassname: string, percentageColor: string } => {
		const budget = state.budget

		if (!budget) return

		const spending = spendingThisMonth(state.budget.categoriesIncluded)

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
				{/* <div>
					<div className="mb-2">
						<label className="pt-8 leading-7 text-3xl font-semibold text-gray-800">Planned payments</label>
					</div>
					<div className="bg-gray-200 h-auto w-full shadow-lg rounded-md p-4">
						<PlannedPaymentsSvg />
					</div>
				</div>
				<div>
					<div className="mb-2">
						<label className="pt-8 leading-7 text-3xl font-semibold text-gray-800">Portfolio</label>
					</div>
					<div className="bg-gray-200 h-auto w-full shadow-lg rounded-md p-4">
						<PortfolioSvg />
					</div>
				</div> */}
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
			{menuModal && <MenuModal onClose={() => setMenuModal(false)} />}
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
	const [category, setCategory] = React.useState<Category | undefined>()

	const onConfirmHandler = () => {
		if (!category) return

		onConfirm({ price, category, created_at: new Date() })
	}

	return (
		<BaseModal onSubmit={onConfirmHandler} onClose={onClose}>
			<div>
				<Input label="Price" value={price} onTxtChange={setPrice} type="number" />
				<div className="flex flex-col space-y-2">
					<label className="leading-7 text-xl text-gray-600">Category</label>
					<CategoriesList
						activeCategories={[category]}
						setCategory={setCategory}
					/>
				</div>
			</div>
		</BaseModal>
	)
}

const MenuModal: React.FC<{
	onClose: () => void
}> = ({
	onClose
}) => {

		return (
			<div className="fixed top-0 left-0 h-full w-full z-20 pointer-events-none opacity-90 bg-gray-700 p-4">
				<div className="flex flex-row cursor-pointer" onClick={onClose}>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="white">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</div>
				<div className="flex justify-center items-center h-full">
					<div className="flex flex-col text-white items-center space-y-12 text-4xl">
						<h2 className="cursor-pointer">Home</h2>
						<h2 className="cursor-pointer">Statistics</h2>
						<h2 className="cursor-pointer">Settings</h2>
					</div>
				</div>
			</div>
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
	const [categories, setCategories] = React.useState<Category[]>([])

	const onConfirmHandler = () => {
		if ((value && parseInt(value) === 0) || !name) return

		onConfirm({ value, name, categoriesIncluded: categories })
	}

	const setCategoriesHandler = (c: Category) => {
		if (categories.includes(c)) {
			setCategories(categories.filter(cx => cx !== c))
		} else {
			setCategories(categories.concat([c]))
		}
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
			<div>
				<label className="leading-7 text-xl text-gray-600">Filter budget by categories</label>
				<CategoriesList
					activeCategories={categories}
					setCategory={setCategoriesHandler}
				/>
			</div>
		</BaseModal>
	)
}

const BaseModal: React.FC<{ onSubmit: () => void, onClose: () => void }> = ({
	onSubmit,
	onClose,
	children
}) => {

	return (
		<div className="bg-gray-100 h-auto absolute border-t-4 shadow-2xl border-gray-600 bottom-0 w-full z-10 p-4 space-y-4 flex flex-col justify-between">
			<div className="flex flex-row justify-end -mb-4 cursor-pointer" onClick={onClose}>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="gray">
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

const CategoriesList: React.FC<{
	activeCategories: Category[],
	setCategory: (c: Category) => void
}> = ({
	activeCategories,
	setCategory
}) => {

		return (
			<div className="flex flex-col">
				<CategoryRow label="FAST FOOD" onClick={() => setCategory("FAST_FOOD")}>
					<PizzaCategory
						onClick={() => setCategory("FAST_FOOD")}
						active={activeCategories.includes("FAST_FOOD")}
					/>
				</CategoryRow>
				<CategoryRow label="RESTAURANT" onClick={() => setCategory("RESTAURANT")}>
					<RestaurantCategory
						onClick={() => setCategory("RESTAURANT")}
						active={activeCategories.includes("RESTAURANT")}
					/>
				</CategoryRow>
				<CategoryRow label="TRANSPORT" onClick={() => setCategory("TRANSPORT")}>
					<TransportCategory
						onClick={() => setCategory("TRANSPORT")}
						active={activeCategories.includes("TRANSPORT")}
					/>
				</CategoryRow>
				<CategoryRow label="HOUSE RENTAL" onClick={() => setCategory("HOUSE RENTAL")}>
					<HouseRentalCategory
						onClick={() => setCategory("HOUSE RENTAL")}
						active={activeCategories.includes("HOUSE RENTAL")}
					/>
				</CategoryRow>
				<CategoryRow label="BILLS" onClick={() => setCategory("BILLS")}>
					<BillsCategory
						onClick={() => setCategory("BILLS")}
						active={activeCategories.includes("BILLS")}
					/>
				</CategoryRow>
				<CategoryRow label="FOOD AND DRINKS" onClick={() => setCategory("FOOD_AND_DRINKS")}>
					<FoodAndDrinks
						onClick={() => setCategory("FOOD_AND_DRINKS")}
						active={activeCategories.includes("FOOD_AND_DRINKS")}
					/>
				</CategoryRow>
				<CategoryRow label="GYM AND FITNESS" onClick={() => setCategory("GYM_AND_FITNESS")}>
					<GymCategory
						onClick={() => setCategory("GYM_AND_FITNESS")}
						active={activeCategories.includes("GYM_AND_FITNESS")}
					/>
				</CategoryRow>
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

const FoodAndDrinks: React.FC<{ active: boolean, onClick: () => void }> = ({
	active,
	onClick
}) => (
	<IconButton
		active={active}
		onClick={onClick}
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14.911 10c-.308 3.325-1.398 5.712-2.949 8h-4.925c-1.373-2.009-2.612-4.372-2.948-8h10.822zm2.089-2h-15c0 5.716 1.826 8.996 4 12h7c2.12-2.911 4-6.333 4-12zm1.119 2c-.057.701-.141 1.367-.252 2h1.55c-.449 1.29-1.5 2.478-2.299 2.914-.358 1.038-.787 1.981-1.26 2.852 3.274-1.143 5.846-4.509 6.142-7.766h-3.881zm-7.745-3.001c4.737-4.27-.98-4.044.117-6.999-3.783 3.817 1.409 3.902-.117 6.999zm-2.78.001c3.154-2.825-.664-3.102.087-5.099-2.642 2.787.95 2.859-.087 5.099zm9.406 15h-15v2h15v-2z" /></svg>
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

const GymCategory: React.FC<{ active: boolean, onClick: () => void }> = ({
	active,
	onClick
}) => (
	<IconButton
		active={active}
		onClick={onClick}
	>
		<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M24 24h-24v-2h2v-14h-2v-2h24v2h-2v14h2v2zm-13-5h-2v4h2v-4zm4 0h-2v4h2v-4zm5-11h-16v14h3v-5h10v5h3v-14zm-6 7h-4v-5h4v5zm-5 0h-4v-5h4v5zm10 0h-4v-5h4v5zm-10-12v1c0 .551-.447 1-1 1-.552 0-1-.448-1-1v-3c0-.552.448-1 1-1 .553 0 1 .449 1 1v1h6v-1c0-.551.447-1 1-1 .553 0 1 .449 1 1v3c0 .551-.447 1-1 1-.553 0-1-.449-1-1v-1h-6zm9.5 0v.5c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5s.5.224.5.5v.5h.5v1h-.5zm-13-1v-.5c0-.276.224-.5.5-.5s.5.224.5.5v2c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-.5h-.5v-1h.5z"/></svg>
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



// unDraw online payments
// width="888.07971"
// height="534.96981" 
const PlannedPaymentsSvg: React.FC = () => (
	<svg id="a139742c-031f-4297-9910-0b661ecf4262" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="296" height="178" viewBox="0 0 888.07971 534.96981"><title>online_payments</title><path d="M214.1947,574.21548l-5.333-21.03429A273.135,273.135,0,0,0,179.8838,542.7848l-.67337,9.77549L176.48,541.79069c-12.212-3.48717-20.51983-5.02321-20.51983-5.02321s11.22195,42.67366,34.7592,75.29821l27.426,4.81755-21.30654,3.072a110.50245,110.50245,0,0,0,9.53073,10.10012c34.24,31.78207,72.377,46.36387,85.18129,32.5693s-4.57282-50.7417-38.81286-82.52378c-10.61474-9.85276-23.94912-17.75951-37.29675-23.98229Z" transform="translate(-155.96015 -182.5151)" fill="#e6e6e6" /><path d="M264.9155,551.37272l6.30738-20.76292a273.13329,273.13329,0,0,0-19.4325-23.8785l-5.6294,8.02019,3.22943-10.63063C240.73891,494.82328,234.421,489.214,234.421,489.214s-12.45157,42.33122-9.16631,82.42573l20.98773,18.30061-19.82728-8.3836a110.50442,110.50442,0,0,0,2.938,13.57259c12.88281,44.90561,37.99241,77.10132,56.0839,71.91112s22.31392-45.80088,9.43111-90.70649c-3.9938-13.92118-11.32161-27.58227-19.53123-39.80866Z" transform="translate(-155.96015 -182.5151)" fill="#e6e6e6" /><rect x="0.07971" y="487.64984" width="888" height="2.24072" fill="#3f3d56" /><path d="M296.338,438.128s-6.91528,83.14848-8.40005,100.9657a126.7102,126.7102,0,0,1-7.42384,32.66491s-2.96954,5.93908-2.96954,11.87815v75.7232s-5.93907,0-4.4543,5.93908,2.96953,16.33245,2.96953,16.33245h22.27153s-1.48476-4.4543,2.96954-5.93907,0-13.36292,0-13.36292l23.7563-89.08612,35.63445-74.23843s20.78676,66.81459,25.24107,74.23843c0,0,16.33245,83.14705,19.302,90.57089s4.4543,7.42384,2.96953,10.39338-1.48476,5.93907,0,7.42384,29.69538,0,29.69538,0l-7.42385-105.41857L417.11284,450.00754l-68.29936-20.78676Z" transform="translate(-155.96015 -182.5151)" fill="#2f2e41" /><path d="M292.39227,669.7533s-7.42384-26.72583-19.302-5.93907-11.87815,28.2106-11.87815,28.2106-19.302,28.21061,7.42384,25.24107,20.78676-16.33245,20.78676-16.33245,10.39338-5.93908,10.39338-10.39338S292.39227,669.7533,292.39227,669.7533Z" transform="translate(-155.96015 -182.5151)" fill="#2f2e41" /><path d="M412.65853,666.78377s7.42384-26.72584,19.302-5.93908,11.87815,28.21061,11.87815,28.21061,19.302,28.2106-7.42384,25.24106-20.78676-16.33245-20.78676-16.33245-10.39338-5.93908-10.39338-10.39338S412.65853,666.78377,412.65853,666.78377Z" transform="translate(-155.96015 -182.5151)" fill="#2f2e41" /><path d="M342.8744,237.68563s2.96954,19.302-5.93907,23.75629,19.302,20.78677,26.72584,20.78677S384.44793,267.381,384.44793,267.381s-7.42385-22.27153-5.93908-26.72584Z" transform="translate(-155.96015 -182.5151)" fill="#a0616a" /><circle cx="203.24671" cy="38.83808" r="31.18014" fill="#a0616a" /><path d="M420.08237,285.19822l-37.118-22.4886s-21.1191,23.97337-43.96746-2.75246l-39.18081,10.39338,5.93908,100.96426s-8.90861,40.08876-5.93908,47.5126-7.42384,10.39338-4.4543,11.87815,0,11.87815,0,11.87815,57.906,29.69537,121.751,7.42384l-5.93908-19.302a15.58017,15.58017,0,0,0-2.96954-14.84769s5.93908-8.90861-1.48476-16.33245c0,0,2.96953-13.36292-4.45431-19.302l-1.48477-20.78676,4.45431-10.39338Z" transform="translate(-155.96015 -182.5151)" fill="#cfcce0" /><path d="M343.24976,206.87536s-3.7173,8.04469,11.15192,4.82681c0,0,5.576,3.21788,5.576-1.60893,0,0,7.43461,8.04469,9.29326,3.21787s5.576,1.60894,5.576,1.60894l3.7173-8.04469,3.71731,4.82681H395.292s3.7173-32.17875-40.89036-28.96087-22.663,54.20194-22.663,54.20194.35921-9.15169,4.07651-4.32487S343.24976,206.87536,343.24976,206.87536Z" transform="translate(-155.96015 -182.5151)" fill="#2f2e41" /><path d="M433.44529,344.589l1.48477,31.18014s5.93908,57.906-5.93907,83.147v13.36291s-2.96954,34.14968-17.81723,32.66491,4.45431-48.99736,4.45431-48.99736l-2.96954-65.32982L409.689,353.49758Z" transform="translate(-155.96015 -182.5151)" fill="#a0616a" /><path d="M403.74992,286.683l14.81131-2.40638a72.31337,72.31337,0,0,1,20.82314,38.04083c4.4543,23.7563,5.93907,28.2106,5.93907,28.2106L409.689,359.43666l-19.302-37.11922Z" transform="translate(-155.96015 -182.5151)" fill="#cfcce0" /><rect x="184.01662" y="87.22321" width="234.31056" height="116.39453" fill="#fff" /><path d="M365.56206,276.73782c-6.01967-3.62-13.278-3.3435-16.0373-3.067,1.05081,2.56549,4.20371,9.10919,10.22338,12.731,6.03437,3.62916,13.28306,3.34441,16.03823,3.06977C374.736,286.907,371.58266,280.36056,365.56206,276.73782Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><path d="M393.84906,348.57067H356.22553a8.4653,8.4653,0,1,0,0,16.93059h37.62353a8.4653,8.4653,0,1,0,0-16.93059Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><path d="M564.22146,259.21477H353.27787A18.68583,18.68583,0,0,0,334.592,277.90064V380.67657a18.68587,18.68587,0,0,0,18.68587,18.68587H564.22146a18.68587,18.68587,0,0,0,18.68587-18.68587V277.90064A18.68583,18.68583,0,0,0,564.22146,259.21477ZM348.05876,271.9614c.41656-.07532,10.29412-1.75626,18.47328,3.1653,8.17871,4.92063,11.32105,14.43582,11.45057,14.83815l.33067,1.026-1.06138.1883a28.17463,28.17463,0,0,1-4.57756.33619,27.25632,27.25632,0,0,1-13.89618-3.50241c-8.17871-4.91972-11.32059-14.43491-11.4501-14.83723l-.33068-1.026Zm45.7903,95.421H356.22553a10.34647,10.34647,0,0,1,0-20.69294h37.62353a10.34647,10.34647,0,1,1,0,20.69294Zm171.18709-1.88117a11.32027,11.32027,0,0,1-11.28706,11.28706H525.53144a11.32027,11.32027,0,0,1-11.28706-11.28706V348.57067a11.32023,11.32023,0,0,1,11.28706-11.28706h28.21765a11.32023,11.32023,0,0,1,11.28706,11.28706Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><path d="M534.467,362.2092H522.23938a3.29206,3.29206,0,0,0,0,6.58412H534.467a3.29206,3.29206,0,0,0,0-6.58412Zm0,4.70294H522.23938a1.41089,1.41089,0,1,1,0-2.82177H534.467a1.41089,1.41089,0,0,1,0,2.82177Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><path d="M557.04115,362.2092H544.8135a3.29206,3.29206,0,0,0,0,6.58412h12.22765a3.29206,3.29206,0,0,0,0-6.58412Zm0,4.70294H544.8135a1.41089,1.41089,0,1,1,0-2.82177h12.22765a1.41089,1.41089,0,0,1,0,2.82177Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><path d="M534.467,353.7439H522.23938a3.29206,3.29206,0,0,0,0,6.58412H534.467a3.29206,3.29206,0,0,0,0-6.58412Zm0,4.70294H522.23938a1.41088,1.41088,0,1,1,0-2.82176H534.467a1.41088,1.41088,0,1,1,0,2.82176Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><path d="M557.04115,353.7439H544.8135a3.29206,3.29206,0,0,0,0,6.58412h12.22765a3.29206,3.29206,0,0,0,0-6.58412Zm0,4.70294H544.8135a1.41088,1.41088,0,1,1,0-2.82176h12.22765a1.41088,1.41088,0,1,1,0,2.82176Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><path d="M534.467,345.27861H522.23938a3.29206,3.29206,0,0,0,0,6.58412H534.467a3.29206,3.29206,0,0,0,0-6.58412Zm0,4.70294H522.23938a1.41089,1.41089,0,1,1,0-2.82177H534.467a1.41089,1.41089,0,0,1,0,2.82177Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><path d="M557.04115,345.27861H544.8135a3.29206,3.29206,0,0,0,0,6.58412h12.22765a3.29206,3.29206,0,0,0,0-6.58412Zm0,4.70294H544.8135a1.41089,1.41089,0,1,1,0-2.82177h12.22765a1.41089,1.41089,0,0,1,0,2.82177Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><path d="M277.54458,326.77175s-13.36291,56.4212,2.96954,56.4212,54.93644-63.84505,54.93644-63.84505,40.08875-20.78676,23.7563-28.2106-37.11922,11.87815-37.11922,11.87815l-23.985,33.29991-1.2561-16.96746Z" transform="translate(-155.96015 -182.5151)" fill="#a0616a" /><path d="M308.72473,279.25915l-8.90862-8.90861s-17.81722,10.39338-19.302,20.78676-8.90861,43.05829-8.90861,43.05829l27.46822,2.22715,8.90861-13.36292Z" transform="translate(-155.96015 -182.5151)" fill="#cfcce0" /><path d="M730.74286,258.1379c-1.11855-3.30279-15.14535-14.52981-6.55009-16.41686l7.04866,9.39858,32.40661-32.406,3.25929,3.25929Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><path d="M730.74286,368.33187c-1.11855-3.30278-15.14535-14.5298-6.55009-16.41685l7.04866,9.39858,32.40661-32.406,3.25929,3.25929Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><path d="M730.74286,480.10005c-1.11855-3.30278-15.14535-14.5298-6.55009-16.41685l7.04866,9.39858,32.40661-32.406,3.25929,3.25928Z" transform="translate(-155.96015 -182.5151)" fill="#6c63ff" /><circle cx="672.94144" cy="62.22326" r="10" fill="#3f3d56" /><rect x="710.44122" y="61.22319" width="161" height="2" fill="#3f3d56" /><circle cx="672.94144" cy="172.41724" r="10" fill="#3f3d56" /><rect x="710.44122" y="171.41703" width="161" height="2" fill="#3f3d56" /><circle cx="672.94144" cy="284.18542" r="10" fill="#3f3d56" /><rect x="710.44122" y="283.1851" width="161" height="2" fill="#3f3d56" /><polygon points="600.04 312.485 550.04 312.485 550.04 261.485 584.04 261.485 584.04 263.485 552.04 263.485 552.04 310.485 598.04 310.485 598.04 287.485 600.04 287.485 600.04 312.485" fill="#3f3d56" /><polygon points="600.04 200.485 550.04 200.485 550.04 149.485 584.04 149.485 584.04 151.485 552.04 151.485 552.04 198.485 598.04 198.485 598.04 175.485 600.04 175.485 600.04 200.485" fill="#3f3d56" /><polygon points="600.04 86.485 550.04 86.485 550.04 35.485 584.04 35.485 584.04 37.485 552.04 37.485 552.04 84.485 598.04 84.485 598.04 61.485 600.04 61.485 600.04 86.485" fill="#3f3d56" /></svg>
)

// unDraw make it rain
// width="974"
// height="714.52"
function PortfolioSvg() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			width="324"
			height="238"
			data-name="Layer 1"
			viewBox="0 0 974 714.52"
		>
			<defs>
				<linearGradient
					id="0716a939-3e70-42e2-b2a4-62d4623bb7b7"
					x1="574.72"
					x2="574.72"
					y1="713.31"
					y2="358.2"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0" stopColor="gray" stopOpacity="0.25"></stop>
					<stop offset="0.54" stopColor="gray" stopOpacity="0.12"></stop>
					<stop offset="1" stopColor="gray" stopOpacity="0.1"></stop>
				</linearGradient>
				<linearGradient
					id="246fdb29-47ea-4475-84d7-0cdffd1436cc"
					x1="2975.38"
					x2="2975.38"
					y1="757.78"
					y2="205.6"
					gradientTransform="matrix(-1 0 0 1 3906 0)"
					xlinkHref="#0716a939-3e70-42e2-b2a4-62d4623bb7b7"
				></linearGradient>
			</defs>
			<path
				fill="#6c63ff"
				d="M241.9 454.74c-12.81 3.87-24.8 13.24-28 26.24-3.66 14.94 4.78 30 6 45.34 3.94 50.26-67.56 85.72-57.36 135.09 4.05 19.63 20.42 34.07 36.55 46 25.84 19.05 54.51 35.88 86.26 40.63 48.19 7.22 98.54-14 145.38-.59 37.78 10.82 66.69 42.53 104.21 54.23 28.56 8.91 59.33 5.4 89 1.79 16-1.94 32.76-4.18 45.67-13.78 24-17.87 25.51-53.16 41.58-78.45 24.82-39 79.24-46.66 124.87-39.08S926 698.4 972.23 696.88c9.88-.33 20-1.67 28.62-6.52 10.48-5.89 17.56-16.27 23.82-26.54a429.45 429.45 0 0062.27-213.39c.27-12.95-.19-26.46-6.28-37.89-7.7-14.46-23.09-23.11-38.41-28.93-36.79-14-77.43-16.29-113.48-32.08-34.77-15.23-62.93-41.94-93.21-64.83a496.49 496.49 0 00-204.49-91.07c-17.39-3.36-35.44-5.76-52.72-1.88-19.91 4.47-37.07 16.88-52.5 30.24-41.05 35.54-73.95 79.39-111.78 118.34a636.39 636.39 0 01-84.92 73.23c-14 10.09-28.88 22.07-44.48 29.53-14.28 6.82-27.67 5.1-42.77 9.65z"
				opacity="0.2"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="none"
				stroke="#535461"
				strokeMiterlimit="10"
				strokeWidth="2"
				d="M311.88 46.14s-38.65 51.33-11 111.16-48.19 155.96-48.19 155.96"
			></path>
			<path
				fill="#8ed16f"
				d="M442.21 119.67c-3.07 13.21-17.76 21.08-17.76 21.08s-9.7-13.55-6.63-26.76 11-22.65 17.76-21.08 9.7 13.55 6.63 26.76z"
				transform="translate(-113 -92.74)"
			></path>
			<ellipse
				cx="429.54"
				cy="116.72"
				fill="#8ed16f"
				rx="7.71"
				ry="2.89"
				transform="rotate(-76.9 314.63 141.512)"
			></ellipse>
			<ellipse
				cx="429.54"
				cy="116.72"
				opacity="0.3"
				rx="7.71"
				ry="2.89"
				transform="rotate(-76.9 314.63 141.512)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M435.53 178.36c-12.76 4.6-27.35-3.46-27.35-3.46s6.1-15.51 18.87-20.1 25-3 27.35 3.46-6.11 15.5-18.87 20.1z"
				transform="translate(-113 -92.74)"
			></path>
			<ellipse
				cx="431.13"
				cy="166.12"
				fill="#8ed16f"
				rx="7.71"
				ry="2.89"
				transform="rotate(-20 107.753 441.898)"
			></ellipse>
			<ellipse
				cx="431.13"
				cy="166.12"
				opacity="0.3"
				rx="7.71"
				ry="2.89"
				transform="rotate(-20 107.753 441.898)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M432.56 225.13c-12.76 4.6-27.35-3.46-27.35-3.46s6.1-15.51 18.87-20.1 25-3 27.35 3.46-6.11 15.51-18.87 20.1z"
				transform="translate(-113 -92.74)"
			></path>
			<ellipse
				cx="428.15"
				cy="212.9"
				fill="#8ed16f"
				rx="7.71"
				ry="2.89"
				transform="rotate(-19.8 106.054 490.29)"
			></ellipse>
			<ellipse
				cx="428.15"
				cy="212.9"
				opacity="0.3"
				rx="7.71"
				ry="2.89"
				transform="rotate(-19.8 106.054 490.29)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M447.47 280c-12.76 4.6-27.35-3.46-27.35-3.46s6.1-15.51 18.87-20.1 25-3 27.35 3.46-6.11 15.53-18.87 20.1z"
				transform="translate(-113 -92.74)"
			></path>
			<ellipse
				cx="443.06"
				cy="267.79"
				fill="#8ed16f"
				rx="7.71"
				ry="2.89"
				transform="rotate(-19.8 120.977 545.177)"
			></ellipse>
			<ellipse
				cx="443.06"
				cy="267.79"
				opacity="0.3"
				rx="7.71"
				ry="2.89"
				transform="rotate(-19.8 120.977 545.177)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M437.77 330.18c-12.76 4.6-27.35-3.46-27.35-3.46s6.1-15.51 18.87-20.1 25-3 27.35 3.46-6.1 15.51-18.87 20.1z"
				transform="translate(-113 -92.74)"
			></path>
			<ellipse
				cx="433.37"
				cy="317.95"
				fill="#8ed16f"
				rx="7.71"
				ry="2.89"
				transform="rotate(-20 109.708 593.154)"
			></ellipse>
			<ellipse
				cx="433.37"
				cy="317.95"
				opacity="0.3"
				rx="7.71"
				ry="2.89"
				transform="rotate(-20 109.708 593.154)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M377.92 191.65c9.42 9.76 26.07 9 26.07 9s1.37-16.61-8.05-26.37-21.09-13.78-26.07-9-1.37 16.61 8.05 26.37z"
				transform="translate(-113 -92.74)"
			></path>
			<ellipse
				cx="387.28"
				cy="182.62"
				fill="#8ed16f"
				rx="2.89"
				ry="7.71"
				transform="rotate(-43.99 216.01 276.127)"
			></ellipse>
			<ellipse
				cx="387.28"
				cy="182.62"
				opacity="0.3"
				rx="2.89"
				ry="7.71"
				transform="rotate(-43.99 216.01 276.127)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M372.51 346.64c9.42 9.76 26.07 9 26.07 9s1.37-16.61-8.05-26.37-21.09-13.78-26.07-9-1.37 16.61 8.05 26.37z"
				transform="translate(-113 -92.74)"
			></path>
			<ellipse
				cx="381.86"
				cy="337.61"
				fill="#8ed16f"
				rx="2.89"
				ry="7.71"
				transform="rotate(-43.99 210.604 431.128)"
			></ellipse>
			<ellipse
				cx="381.86"
				cy="337.61"
				opacity="0.3"
				rx="2.89"
				ry="7.71"
				transform="rotate(-43.99 210.604 431.128)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M385 246.43c12.14 6.06 27.57-.24 27.57-.24s-4.25-16.11-16.38-22.17-24.48-6-27.57.24 4.24 16.11 16.38 22.17z"
				transform="translate(-113 -92.74)"
			></path>
			<ellipse
				cx="390.8"
				cy="234.8"
				fill="#8ed16f"
				rx="2.89"
				ry="7.71"
				transform="rotate(-63.48 259.318 279.767)"
			></ellipse>
			<ellipse
				cx="390.8"
				cy="234.8"
				opacity="0.3"
				rx="2.89"
				ry="7.71"
				transform="rotate(-63.48 259.318 279.767)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M390.09 301c12.14 6.06 27.57-.24 27.57-.24s-4.25-16.11-16.38-22.17-24.48-6-27.57.24S378 295 390.09 301z"
				transform="translate(-113 -92.74)"
			></path>
			<ellipse
				cx="395.9"
				cy="289.38"
				fill="#8ed16f"
				rx="2.89"
				ry="7.71"
				transform="rotate(-63.48 264.412 334.35)"
			></ellipse>
			<ellipse
				cx="395.9"
				cy="289.38"
				opacity="0.3"
				rx="2.89"
				ry="7.71"
				transform="rotate(-63.48 264.412 334.35)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M238.73 249.21s70.59 70.59 30.74 175.34 68.31 278.94 68.31 278.94-1.16-.17-3.31-.55c-145-25.59-217-191.41-136.4-314.59 29.93-45.8 54.58-99.52 40.66-139.14z"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#8ed16f"
				d="M113 534.72s80.55-12.83 87.89 59.36 154.89 82.2 154.89 82.2-1 .66-2.77 1.84c-121.83 80-238.29 50.94-220.74-55.25 6.54-39.49 6-79.14-19.27-88.15z"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#fff"
				d="M113 534.72s80.55-12.83 87.89 59.36 154.89 82.2 154.89 82.2-1 .66-2.77 1.84c-121.83 80-238.29 50.94-220.74-55.25 6.54-39.49 6-79.14-19.27-88.15z"
				opacity="0.3"
				transform="translate(-113 -92.74)"
			></path>
			<ellipse
				cx="105.34"
				cy="383.3"
				fill="#8ed16f"
				rx="22.15"
				ry="57.79"
			></ellipse>
			<ellipse
				cx="105.34"
				cy="383.3"
				opacity="0.3"
				rx="22.15"
				ry="57.79"
			></ellipse>
			<ellipse
				cx="192.81"
				cy="662.42"
				fill="#8ed16f"
				rx="14.93"
				ry="33.23"
				transform="rotate(-45 24.373 752.444)"
			></ellipse>
			<ellipse
				cx="192.81"
				cy="662.42"
				opacity="0.3"
				rx="14.93"
				ry="33.23"
				transform="rotate(-45 24.373 752.444)"
			></ellipse>
			<path
				fill="url(#0716a939-3e70-42e2-b2a4-62d4623bb7b7)"
				d="M836.89 358.2H312.55a23.89 23.89 0 00-23.89 23.89v307.33a23.89 23.89 0 0023.89 23.89h524.34a23.89 23.89 0 0023.89-23.89V382.09a23.89 23.89 0 00-23.89-23.89z"
				transform="translate(-113 -92.74)"
			></path>
			<rect
				width="558.65"
				height="346.75"
				x="182.39"
				y="269.64"
				fill="#6c63ff"
				rx="24.81"
				ry="24.81"
			></rect>
			<path fill="#6c63ff" d="M182.39 330.32H741.04V393.89H182.39z"></path>
			<path d="M182.39 330.32H741.04V393.89H182.39z" opacity="0.3"></path>
			<path
				fill="#d6d6e3"
				d="M235.37 441.09H688.0699999999999V471.90999999999997H235.37z"
			></path>
			<circle cx="272.93" cy="548.97" r="44.31" fill="#6c63ff"></circle>
			<circle cx="272.93" cy="548.97" r="44.31" opacity="0.3"></circle>
			<path
				fill="url(#246fdb29-47ea-4475-84d7-0cdffd1436cc)"
				d="M822.28 276.88a9.7 9.7 0 004.27 5.4c9.19 6.07 29.17 4.78 31.57 4.78.51 0 1.18.91 1.92 2.44 3.53 7.28 9 28.62 9.37 33.42.49 5.81 5.89 33 14.73 43.13.27.31.54.6.8.87 8.67 8.71 18.84-.87 18.84-.87l1.46-5.07c-.41 2-.87 4.33-1.33 6.94-.23 1.31-.46 2.7-.68 4.13a158.29 158.29 0 00-2.07 24.37 88.41 88.41 0 00.38 8.88c.08.82.17 1.63.28 2.42a84.78 84.78 0 01.66 10.84c-.08 21.52-5.57 48.29-5.57 48.29l.21-.07c-.13.67-.21 1-.21 1l.32-.1q-.23 1.49-.44 3.05c-1.86 13.5-2.93 30.3-3.44 40a80.1 80.1 0 00.68 15.32l9.76 68.71v32a56.5 56.5 0 001.76 14.38c3.18 12.09.56 54.29-.91 74.31-.41 5.46-.73 9.28-.82 10.38v.33l.28-.11v.35a5.65 5.65 0 011.3-.38c-3.87 6-10.88 15.92-16.27 17.59A17.07 17.07 0 00881 749l-.14.19-.2.28a6 6 0 00-1.17 3.06 3.38 3.38 0 01-.18-.59c-.41 2.23.93 4.27 5.14 5.26a34.6 34.6 0 007.45.6c14.6 0 40.51-4.49 43.37-9.32v-16.66l.47.15v.15l1.79.59 4.91-16.48c5.89-4.36 1-82.39 0-100.32-.9-16.34 9.21-81.34 11-92.79l-.24-.29.27-1.67a7.11 7.11 0 011 .88 13.07 13.07 0 011.53 2.26 30.22 30.22 0 012.17 4.48c9.88 24.64 14.33 95.1 14.33 101.42v66.26a69 69 0 002.7 19.33 82.91 82.91 0 012.1 10.06c.21 1.33.39 2.65.56 3.91s.34 2.7.47 3.88c0 .31.07.61.1.89s0 .27 0 .41c.27 2.61.41 4.32.41 4.32a1 1 0 01.2-.39l.05.63a1.35 1.35 0 01.39-.62 9.47 9.47 0 011.32-1.08v8.42l-.24-.18v1.45c10.18 7.68 26.75 10 39.47 9.91 8.25 0 14.93-1 17.25-2.16 3.32-1.63 1.5-5.43-1.52-8.34-2.34-2.26-5.39-4-7.32-3.78-3.22.35-14.23-12.12-20-18.95l.65-.29.92-.4V613s1.48-43.62 5.89-86.76a153.48 153.48 0 00-7.55-64.36l-.14-.41 1.34.21c1.42.22 2.18.35 2.18.35s0-.34-.09-1h.09s-1.72-18.71-1.74-42.21c0-26.64 2.25-59.12 11.56-77.5 5.36-10.58 7.15-19 7-25.64a26.82 26.82 0 00-4.79-16.4 13 13 0 00-5.51-4.36l-.19-.11h-.1a13.7 13.7 0 00-5.06-1h-20.11a13.43 13.43 0 01-6.64-1.75l-7.87-4.46c-2.62-5.73-3-12.83-2.44-19.49 0-.53.1-1.06.15-1.58l.57-.6c.44-.47.85-1 1.25-1.45a11.15 11.15 0 01-.09 1.18c-.1.63-.27 1-.54 1.08 4.3-.56 9.1-1.41 11.74-4.73.11-.13.21-.27.31-.41a21.43 21.43 0 001.93-4 11.62 11.62 0 011.47-2.68c.66-.86 1.52-1.56 2.23-2.38l.12-.14c2.53-3 2.67-7.3 2.7-11.22.05-9.52-.23-20-6.6-27.14-5.29-5.94-13.73-8.19-21.74-8.45s-16 1.18-24 1.22c-5.44 0-12-.09-15 4.41-1.47 2.21-1.65 5.1-3.25 7.22-.92 1.22-2.33 2.27-2.41 3.79a3.89 3.89 0 00.52 2v.07c1.94 3.82 6.06 6.2 10.36 6.95a25.81 25.81 0 00-2 2.76 26.28 26.28 0 00-4 14c0 .58 0 1.15.06 1.72a26.43 26.43 0 008.38 17.61c-.08.56-.16 1.12-.25 1.67l.18.16q.85.77 1.77 1.46l.22.17v1c0 .58 0 1.17-.06 1.74s0 .92-.06 1.38l-.13-.11-9.77-8.16-15.71-14.54s-39.28-28.59-41.25-15a9.79 9.79 0 001.87 6.78c7.21 11 32 20.36 32 20.36s14.78 15.63 24.67 32.48c-.35.19-.7.37-1.07.54-8.8 4.09-21.64 2.36-21.64 2.36-14.83 2.31-16.17 18.56-16.09 25.13V326.12L873 279.91l-.06-.14a9.73 9.73 0 00-7.36-5.78c-13.16-2.21-46.05-6.82-43.3 2.89zm82.39 449a8.57 8.57 0 01.87-.16l-.09.14z"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#aca9c9"
				d="M1003 716.43s18.64 23.43 22.95 22.95 14.34 9.08 8.61 12-38.72 4.78-55-7.65V725zM908.81 717.86s-11 19.6-18.64 22-14.34 11-4.3 13.39 45.9-2.87 49.24-8.61v-25.35z"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#618fd8"
				d="M895 525.31l9.5 67.78v31.51a56.48 56.48 0 001.72 14.18c3.1 11.93.55 53.55-.89 73.3-.47 6.44-.83 10.56-.83 10.56 6.21-2.87 32.51 6.21 32.51 6.21l2.66-9.05 2.12-7.2c5.74-4.3 1-81.27 0-99-.65-12.11 4.75-51.37 8.21-74.9 1-6.65 1.81-12 2.3-15.22.31-2 .48-3.11.48-3.11a10.47 10.47 0 012.58 3.11 29.93 29.93 0 012.11 4.42c9.62 24.31 14 93.81 14 100v65.36a68.92 68.92 0 002.63 19.07 100 100 0 012.59 13.77c.68 5.19 1 9.37 1 9.37.48-2.87 30.12-15.78 30.12-15.78v-109s1.43-43 5.74-85.58a152.68 152.68 0 00-5.5-57.58c-1.19-4.07-2.38-7.52-3.41-10.25-1.75-4.65-3-7.22-3-7.22H904c-1.64.31-3 3.61-4.23 8.62-.8 3.36-1.5 7.48-2.11 12-1.81 13.31-2.85 29.88-3.35 39.46a79.86 79.86 0 00.69 15.17z"
				transform="translate(-113 -92.74)"
			></path>
			<g opacity="0.1">
				<path
					d="M1006.09 720V611s1.43-43 5.74-85.58-12-75.06-12-75.06h1.91s16.25 32.51 12 75.06S1008 611 1008 611v109s-29.64 12.91-30.12 15.78c0 0 0-.64-.15-1.74 6.46-4.49 28.36-14.04 28.36-14.04zM907.37 722.34a7.42 7.42 0 00-2.63.54v-.48a17.06 17.06 0 012.63-.06zM940.12 712.84c5.74-4.3 1-81.27 0-99s11-93.22 11-93.22a8.34 8.34 0 011.65 1.7c-1.76 11.28-11.6 75.41-10.73 91.52 1 17.69 5.74 94.66 0 99l-4.78 16.25-1.74-.58z"
					transform="translate(-113 -92.74)"
				></path>
			</g>
			<path
				fill="#f7c4a7"
				d="M914.54 332.05l-10 35.38s-10.52 10-19.12 0-13.9-36.81-14.42-42.55-8.13-35.38-11-35.38-31.55 1.91-34.9-10c-2.68-9.58 29.34-5 42.16-2.85a9.5 9.5 0 017.17 5.7l19.66 46.95s10.41-12.07 20.45 2.75zM979.08 249.82s-12.43 34.9 3.35 47.33S926 312.93 926 312.93l9.8-9.32s6.93-27.49 2.15-50.44z"
				transform="translate(-113 -92.74)"
			></path>
			<path
				d="M963.78 297.15s12.67-3.11 12.67-6.45l11.23 6.45h28.21s20.56 11.47 3.35 45.9-9.56 119-9.56 119-61.19-11-111.87 5.74c0 0 7.65-37.77 4.78-59.28s4.78-51.63 4.78-51.63l4.3-18.17s-.24-17-17.93-8.37c0 0-2.63-24.62 15.54-27.49 0 0 21 2.87 27.25-7.65 0 .04 13.87 8.17 27.25 1.95z"
				opacity="0.1"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#e14b5a"
				d="M963.78 296.2s12.67-3.11 12.67-6.45l8.23 4.73a13 13 0 006.46 1.72h19.73a13 13 0 0110.57 5.38c4.53 6.37 8.59 18.93-2.2 40.52-17.21 34.42-9.56 119-9.56 119s-61.19-11-111.87 5.74c0 0 7.65-37.77 4.78-59.28s4.78-51.56 4.78-51.56l4.3-18.17s-.24-17-17.93-8.37c0 0-2.56-23.94 14.79-27.36a4.9 4.9 0 011.47-.1c3.71.39 21 1.64 26.54-7.73-.01.01 13.86 8.14 27.24 1.93z"
				transform="translate(-113 -92.74)"
			></path>
			<path
				d="M1012.07 339.7s-15.3 9.56-40.16 0c0 0-27.25-10-35.86-29.64s43.5 3.35 43.5 3.35 11 0 14.34-2.39 26.78 18.16 18.18 28.68z"
				opacity="0.1"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#f7c4a7"
				d="M1012.07 337.79s-15.3 9.56-40.16 0c0 0-27.25-10-35.86-29.64S907.37 267 907.37 267s-34.9-13.39-33-26.77 40.16 14.82 40.16 14.82l15.3 14.34 49.72 42.07s11 0 14.34-2.39 26.78 18.2 18.18 28.72z"
				transform="translate(-113 -92.74)"
			></path>
			<path
				d="M937.49 254.6l41.11-3.35a94.37 94.37 0 00-4.29 19.47 26.27 26.27 0 01-36.8 1 46.73 46.73 0 00-.02-17.12z"
				opacity="0.1"
				transform="translate(-113 -92.74)"
			></path>
			<circle cx="842.9" cy="158.28" r="26.29" fill="#f7c4a7"></circle>
			<path
				d="M970.33 256.73c-1.54-2.54 1.59-5.85.56-8.63-.95-2.56-4.73-3-6-5.39-1-1.93 0-4.3-.4-6.43-.57-2.75-3.53-4.46-6.34-4.6s-5.52.91-8.19 1.81c-4.35 1.47-8.93 2.6-13.49 2.08s-9.11-3-11.14-7.07a4 4 0 01-.51-1.94c.08-1.5 1.46-2.53 2.35-3.73 1.56-2.09 1.74-4.94 3.16-7.12 2.9-4.44 9.27-4.33 14.57-4.35 7.8 0 15.56-1.46 23.36-1.2s16 2.47 21.17 8.33c6.2 7.05 6.48 17.37 6.43 26.77 0 3.87-.16 8.08-2.63 11.07-.72.87-1.6 1.59-2.29 2.48-1.5 2-1.9 4.56-3.31 6.59-2.5 3.61-7.38 4.49-11.73 5.07 1.28-.17.22-8.74 0-9.53-.84-3.94-1.75-3.86-5.57-4.21z"
				opacity="0.1"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#281c1c"
				d="M970.33 255.78c-1.54-2.54 1.59-5.85.56-8.63-.95-2.56-4.73-3-6-5.39-1-1.93 0-4.3-.4-6.43-.57-2.75-3.53-4.46-6.34-4.6s-5.52.91-8.19 1.81c-4.35 1.47-8.93 2.6-13.49 2.08s-9.11-3-11.14-7.07a4 4 0 01-.51-1.94c.08-1.5 1.46-2.53 2.35-3.73 1.56-2.09 1.74-4.94 3.16-7.12 2.9-4.44 9.27-4.33 14.57-4.35 7.8 0 15.56-1.46 23.36-1.2s16 2.47 21.17 8.33c6.2 7.05 6.48 17.37 6.43 26.77 0 3.87-.16 8.08-2.63 11.07-.72.87-1.6 1.59-2.29 2.48-1.5 2-1.9 4.56-3.31 6.59-2.5 3.61-7.38 4.49-11.73 5.07 1.28-.17.22-8.74 0-9.53-.84-3.99-1.75-3.87-5.57-4.21z"
				transform="translate(-113 -92.74)"
			></path>
			<path
				d="M1011.83 340.9s-12.91-33.47-22.95-34.42 19.12 0 19.12 0l9.56 17.21z"
				opacity="0.1"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#e14b5a"
				d="M1012.79 340.9s-12.91-33.47-22.95-34.42 19.12 0 19.12 0l9.56 17.21z"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#618fd8"
				d="M976.65 726.18c.68 5.19 1 9.37 1 9.37.48-2.87 30.12-15.78 30.12-15.78V712a13.18 13.18 0 00-2.26.11c-5.75.77-11.08 3.56-16 6.54a145.93 145.93 0 01-12.86 7.53z"
				transform="translate(-113 -92.74)"
			></path>
			<path
				d="M976.65 726.18c.68 5.19 1 9.37 1 9.37.48-2.87 30.12-15.78 30.12-15.78V712a13.18 13.18 0 00-2.26.11c-5.75.77-11.08 3.56-16 6.54a145.93 145.93 0 01-12.86 7.53z"
				opacity="0.3"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#618fd8"
				d="M904.5 722.64c6.21-2.87 32.51 6.21 32.51 6.21l2.66-9.05c-4.59-.93-9.15-2.09-13.63-3.47a45.34 45.34 0 01-6.12-2.26 41 41 0 00-4.08-1.9c-3.43-1.18-7-.68-10.52-.09-.46 6.44-.82 10.56-.82 10.56z"
				transform="translate(-113 -92.74)"
			></path>
			<path
				d="M904.5 722.64c6.21-2.87 32.51 6.21 32.51 6.21l2.66-9.05c-4.59-.93-9.15-2.09-13.63-3.47a45.34 45.34 0 01-6.12-2.26 41 41 0 00-4.08-1.9c-3.43-1.18-7-.68-10.52-.09-.46 6.44-.82 10.56-.82 10.56z"
				opacity="0.3"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#fff"
				d="M1034.3 749.89a2.86 2.86 0 001.64-1.9 2.81 2.81 0 01-1.64 3.33c-5.74 2.87-38.72 4.78-55-7.65v-1.43c16.28 12.43 49.26 10.52 55 7.65zM885.62 751.8c10 2.39 45.9-2.87 49.24-8.61v1.43c-3.35 5.74-39.2 11-49.24 8.61-4.1-1-5.41-3-5-5.19.32 1.62 1.82 2.96 5 3.76z"
				opacity="0.4"
				transform="translate(-113 -92.74)"
			></path>
			<path
				d="M943.94 403.53s-10.52-3.35-13.39 0-27.4 11.2-27.4 11.2"
				opacity="0.1"
				transform="translate(-113 -92.74)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 271.1H876.05V272.18H824.9z"
				transform="rotate(-180 793.98 225.265)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 272.17H876.05V273.25H824.9z"
				transform="rotate(-180 793.98 226.34)"
			></path>
			<path
				d="M824.9 272.17H876.05V273.25H824.9z"
				opacity="0.1"
				transform="rotate(-180 793.98 226.34)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 273.25H876.05V274.33H824.9z"
				transform="rotate(-180 793.98 227.42)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 274.33H876.05V275.40999999999997H824.9z"
				transform="rotate(-180 793.98 228.495)"
			></path>
			<path
				d="M824.9 274.33H876.05V275.40999999999997H824.9z"
				opacity="0.1"
				transform="rotate(-180 793.98 228.495)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 275.4H876.05V276.47999999999996H824.9z"
				transform="rotate(-180 793.98 229.57)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 276.48H876.05V277.56H824.9z"
				transform="rotate(-180 793.98 230.645)"
			></path>
			<path
				d="M824.9 276.48H876.05V277.56H824.9z"
				opacity="0.1"
				transform="rotate(-180 793.98 230.645)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 277.55H876.05V278.63H824.9z"
				transform="rotate(-180 793.98 231.72)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 278.63H876.05V279.71H824.9z"
				transform="rotate(-180 793.98 232.795)"
			></path>
			<path
				d="M824.9 278.63H876.05V279.71H824.9z"
				opacity="0.1"
				transform="rotate(-180 793.98 232.795)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 262.49H876.05V263.57H824.9z"
				transform="rotate(-180 793.98 216.66)"
			></path>
			<path
				fill="#8ed16f"
				d="M855.5 253.41H906.65V254.49H855.5z"
				transform="rotate(-140.25 807.822 227.995)"
			></path>
			<path
				fill="#8ed16f"
				d="M819.64 236.2H870.79V237.28H819.64z"
				transform="rotate(-140.25 771.965 210.785)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 263.57H876.05V264.65H824.9z"
				transform="rotate(-180 793.98 217.735)"
			></path>
			<path
				d="M824.9 263.57H876.05V264.65H824.9z"
				opacity="0.1"
				transform="rotate(-180 793.98 217.735)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 264.64H876.05V265.71999999999997H824.9z"
				transform="rotate(-180 793.98 218.815)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 265.72H876.05V266.8H824.9z"
				transform="rotate(-180 793.98 219.89)"
			></path>
			<path
				d="M824.9 265.72H876.05V266.8H824.9z"
				opacity="0.1"
				transform="rotate(-180 793.98 219.89)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 266.8H876.05V267.88H824.9z"
				transform="rotate(-180 793.98 220.965)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 267.87H876.05V268.95H824.9z"
				transform="rotate(-180 793.98 222.04)"
			></path>
			<path
				d="M824.9 267.87H876.05V268.95H824.9z"
				opacity="0.1"
				transform="rotate(-180 793.98 222.04)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 268.95H876.05V270.03H824.9z"
				transform="rotate(-180 793.98 223.115)"
			></path>
			<path
				fill="#8ed16f"
				d="M824.9 270.02H876.05V271.09999999999997H824.9z"
				transform="rotate(-180 793.98 224.19)"
			></path>
			<path
				d="M824.9 270.02H876.05V271.09999999999997H824.9z"
				opacity="0.1"
				transform="rotate(-180 793.98 224.19)"
			></path>
			<path
				fill="#8ed16f"
				d="M821.56 278.75H840.1999999999999V315.08H821.56z"
				transform="rotate(-169.48 770.122 255.725)"
			></path>
			<ellipse
				cx="831.11"
				cy="296.96"
				fill="#8ed16f"
				rx="7.65"
				ry="3.82"
				transform="rotate(-79.48 718.88 318.531)"
			></ellipse>
			<ellipse
				cx="831.11"
				cy="296.96"
				opacity="0.1"
				rx="7.65"
				ry="3.82"
				transform="rotate(-79.48 718.88 318.531)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M824.7 354.13H843.34V390.46H824.7z"
				transform="rotate(-169.48 773.26 331.112)"
			></path>
			<ellipse
				cx="834.25"
				cy="372.34"
				fill="#8ed16f"
				rx="7.65"
				ry="3.82"
				transform="rotate(-79.48 722.016 393.922)"
			></ellipse>
			<ellipse
				cx="834.25"
				cy="372.34"
				opacity="0.1"
				rx="7.65"
				ry="3.82"
				transform="rotate(-79.48 722.016 393.922)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M757.49 201.78H776.13V238.11H757.49z"
				transform="rotate(-61.58 632.503 268.39)"
			></path>
			<ellipse
				cx="766.7"
				cy="220.15"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.3 634.38 266.702)"
			></ellipse>
			<ellipse
				cx="766.7"
				cy="220.15"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.3 634.38 266.702)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M687.34 525.31H705.98V561.64H687.34z"
				transform="rotate(-61.58 562.343 591.924)"
			></path>
			<ellipse
				cx="696.55"
				cy="543.69"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 562.24 592.135)"
			></ellipse>
			<ellipse
				cx="696.55"
				cy="543.69"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 562.24 592.135)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M644.41 258.32H663.05V294.65H644.41z"
				transform="rotate(-61.58 519.422 324.933)"
			></path>
			<ellipse
				cx="653.62"
				cy="276.69"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 519.31 325.14)"
			></ellipse>
			<ellipse
				cx="653.62"
				cy="276.69"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 519.31 325.14)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M698.21 201.78H716.85V238.11H698.21z"
				transform="rotate(-61.58 573.217 268.391)"
			></path>
			<ellipse
				cx="707.42"
				cy="220.15"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 573.106 268.598)"
			></ellipse>
			<ellipse
				cx="707.42"
				cy="220.15"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 573.106 268.598)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M733.11 270.67H751.75V307H733.11z"
				transform="rotate(-6.24 -164.211 1279.168)"
			></path>
			<ellipse
				cx="742.19"
				cy="288.87"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-6.24 -164.491 1279.245)"
			></ellipse>
			<ellipse
				cx="742.19"
				cy="288.87"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-6.24 -164.491 1279.245)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M860.17 468.42H878.81V504.75H860.17z"
				transform="rotate(-6.24 -37.089 1477.093)"
			></path>
			<ellipse
				cx="869.25"
				cy="486.61"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-6.24 -37.272 1477.083)"
			></ellipse>
			<ellipse
				cx="869.25"
				cy="486.61"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-6.24 -37.272 1477.083)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M679.37 345.22H698.01V381.55H679.37z"
				transform="rotate(-61.58 554.373 411.833)"
			></path>
			<ellipse
				cx="688.57"
				cy="363.6"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 554.256 412.047)"
			></ellipse>
			<ellipse
				cx="688.57"
				cy="363.6"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 554.256 412.047)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M598.74 322.19H617.38V358.52H598.74z"
				transform="rotate(-61.58 473.745 388.803)"
			></path>
			<ellipse
				cx="607.95"
				cy="340.56"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.3 475.82 387.882)"
			></ellipse>
			<ellipse
				cx="607.95"
				cy="340.56"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.3 475.82 387.882)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M572.92 709.89H591.56V746.22H572.92z"
				transform="rotate(-61.58 447.93 776.509)"
			></path>
			<ellipse
				cx="582.13"
				cy="728.27"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 447.813 776.723)"
			></ellipse>
			<ellipse
				cx="582.13"
				cy="728.27"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 447.813 776.723)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M554.27 711.81H572.91V748.14H554.27z"
				transform="rotate(-79.49 451.363 751.56)"
			></path>
			<path
				d="M554.27 711.81H572.91V748.14H554.27z"
				opacity="0.05"
				transform="rotate(-79.49 451.363 751.56)"
			></path>
			<ellipse
				cx="563.55"
				cy="730.21"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 451.323 751.791)"
			></ellipse>
			<ellipse
				cx="563.55"
				cy="730.21"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 451.323 751.791)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M557.62 722.8H576.26V759.13H557.62z"
				transform="rotate(-79.49 454.711 762.552)"
			></path>
			<ellipse
				cx="566.9"
				cy="741.2"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 454.667 762.79)"
			></ellipse>
			<ellipse
				cx="566.9"
				cy="741.2"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 454.667 762.79)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M610.61 757.01H629.25V793.34H610.61z"
				transform="rotate(-61.58 485.617 823.629)"
			></path>
			<ellipse
				cx="619.82"
				cy="775.39"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 485.506 823.835)"
			></ellipse>
			<ellipse
				cx="619.82"
				cy="775.39"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 485.506 823.835)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M591.97 758.92H610.61V795.25H591.97z"
				transform="rotate(-79.49 489.058 798.67)"
			></path>
			<path
				d="M591.97 758.92H610.61V795.25H591.97z"
				opacity="0.05"
				transform="rotate(-79.49 489.058 798.67)"
			></path>
			<ellipse
				cx="601.25"
				cy="777.32"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 489.013 798.907)"
			></ellipse>
			<ellipse
				cx="601.25"
				cy="777.32"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 489.013 798.907)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M595.31 769.92H613.9499999999999V806.25H595.31z"
				transform="rotate(-79.49 492.402 809.668)"
			></path>
			<ellipse
				cx="604.59"
				cy="788.32"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 492.362 809.9)"
			></ellipse>
			<ellipse
				cx="604.59"
				cy="788.32"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 492.362 809.9)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M667.15 726.65H685.79V762.98H667.15z"
				transform="rotate(-61.58 542.157 793.26)"
			></path>
			<ellipse
				cx="676.36"
				cy="745.02"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 542.04 793.474)"
			></ellipse>
			<ellipse
				cx="676.36"
				cy="745.02"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-61.58 542.04 793.474)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M648.51 728.56H667.15V764.89H648.51z"
				transform="rotate(-79.49 545.6 768.308)"
			></path>
			<path
				d="M648.51 728.56H667.15V764.89H648.51z"
				opacity="0.05"
				transform="rotate(-79.49 545.6 768.308)"
			></path>
			<ellipse
				cx="657.79"
				cy="746.96"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 545.555 768.546)"
			></ellipse>
			<ellipse
				cx="657.79"
				cy="746.96"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 545.555 768.546)"
			></ellipse>
			<path
				fill="#8ed16f"
				d="M651.85 739.55H670.49V775.88H651.85z"
				transform="rotate(-79.49 548.949 779.3)"
			></path>
			<ellipse
				cx="661.13"
				cy="757.96"
				fill="#8ed16f"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 548.904 779.538)"
			></ellipse>
			<ellipse
				cx="661.13"
				cy="757.96"
				opacity="0.1"
				rx="3.82"
				ry="7.65"
				transform="rotate(-79.49 548.904 779.538)"
			></ellipse>
		</svg>
	);
}
