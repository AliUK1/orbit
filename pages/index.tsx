import type { NextPage } from "next";
import Head from "next/head";
import Topbar from "@/components/topbar";
import { useRouter } from "next/router";
import { loginState } from "@/state";
import { Transition, Dialog } from "@headlessui/react";
import { useState, Fragment } from "react";
import Button from "@/components/button";
import axios from "axios";
import Input from "@/components/input";
import { useForm, FormProvider } from "react-hook-form";
import { useRecoilState } from "recoil";
import { toast } from "react-hot-toast";
import { IconPlus, IconRefresh, IconChevronRight, IconBuildingSkyscraper } from "@tabler/icons";

const Home: NextPage = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const [loading, setLoading] = useState(false);
	const methods = useForm();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	
	const gotoWorkspace = (id: number) => {
		router.push(`/workspace/${id}`);
	};
	
	const createWorkspace = async () => {
		setLoading(true);
		const t = toast.loading("Creating workspace...");
		const request = await axios.post("/api/createws", {
			groupId: Number(methods.getValues("groupID")),
		}).catch((err) => {
			console.log(err);
			setLoading(false);
			if (err.response.data.error === "You are not a high enough rank") {
				methods.setError("groupID", {
					type: 'custom',
					message: 'You need to be a rank 10 or higher to create a workspace'
				});
			}
			if (err.response.data.error === "Workspace already exists") {
				methods.setError("groupID", {
					type: 'custom',
					message: 'This group already has a workspace'
				});
			}
		});

		if (request) {
			toast.success("Workspace created!", {
				id: t
			});
			setIsOpen(false);
			router.push(`/workspace/${methods.getValues("groupID")}?new=true`);
		}
	}

	const checkRoles = async () => {
		const request = axios.post('/api/auth/checkRoles', {}).then((res) => {
			router.reload();
		}).catch((err) => {
			console.log(err);
		})

		toast.promise(request, {
			loading: 'Checking roles...',
			success: 'Roles checked!',
			error: 'An error occurred'
		})
	}

	return (
		<div>
			<Head>
				<title>Orbit - Workspaces</title>
				<meta name="description" content="Manage your Roblox workspaces with Orbit" />
			</Head>

			<div className="min-h-screen bg-gray-50 dark:bg-gray-800">
				<Topbar />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Your Workspaces</h1>
						<div className="flex space-x-3">
							<Button 
								onClick={() => setIsOpen(true)}
								classoverride="flex items-center"
							>
								<IconPlus className="mr-2 h-5 w-5" />
								New Workspace
							</Button>
							<Button 
								onClick={() => checkRoles()}
								classoverride="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
							>
								<IconRefresh className="mr-2 h-5 w-5" />
								Check Roles
							</Button>
						</div>
					</div>

					{login.workspaces && !!login.workspaces.length ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{login.workspaces?.map((workspace, i) => (
								<div 
									className="bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer" 
									key={i}
									onClick={() => gotoWorkspace(workspace.groupId)}
								>
									<div 
										className="h-32 bg-cover bg-center" 
										style={{ backgroundImage: `url(${workspace.groupThumbnail})` }} 
									/>
									<div className="p-4 flex items-center justify-between">
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
											{workspace.groupName}
										</h3>
										<IconChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
							<div className="bg-gray-100 dark:bg-gray-600 rounded-full p-4 mb-4">
								<IconBuildingSkyscraper className="h-12 w-12 text-gray-400 dark:text-gray-500" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No workspaces available</h3>
							<p className="text-gray-500 dark:text-gray-400 mb-6">Create a new workspace to get started</p>
							<Button 
								onClick={() => setIsOpen(true)}
								classoverride="flex items-center"
							>
								<IconPlus className="mr-2 h-5 w-5" />
								Create Workspace
							</Button>
						</div>
					)}

					<Transition appear show={isOpen} as={Fragment}>
						<Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0"
								enterTo="opacity-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
							</Transition.Child>

							<div className="fixed inset-0 overflow-y-auto">
								<div className="flex min-h-full items-center justify-center p-4 text-center">
									<Transition.Child
										as={Fragment}
										enter="ease-out duration-300"
										enterFrom="opacity-0 scale-95"
										enterTo="opacity-100 scale-100"
										leave="ease-in duration-200"
										leaveFrom="opacity-100 scale-100"
										leaveTo="opacity-0 scale-95"
									>
										<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
											<Dialog.Title
												as="h3"
												className="text-2xl font-bold text-gray-900 dark:text-white"
											>
												Create New Workspace
											</Dialog.Title>
											<div className="mt-4">
												<form onSubmit={methods.handleSubmit(createWorkspace)}>
													<FormProvider {...methods}>
														<Input 
															label="Group ID" 
															placeholder="Enter your Roblox group ID"  
															{...methods.register('groupID', { 
																required: {value: true, message: 'This field is required'},
																pattern: { value: /^[a-zA-Z0-9-.]*$/, message: 'No spaces or special characters' }, 
																maxLength: { value: 10, message: 'Length must be below 10 characters' } 
															})} 
														/>
													</FormProvider>
												</form>
											</div>

											<div className="mt-6 flex justify-end space-x-3">
												<Button 
													onClick={() => setIsOpen(false)} 
													classoverride="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
												>
													Cancel
												</Button>
												<Button 
													onClick={methods.handleSubmit(createWorkspace)} 
													loading={loading}
												>
													Create
												</Button>
											</div>
										</Dialog.Panel>
									</Transition.Child>
								</div>
							</div>
						</Dialog>
					</Transition>
				</div>
			</div>
		</div>
	);
};

export default Home;
