export const getParticipantsArray = (ref) => {
	const participants = ref.current.value || {};
	return Object.keys(participants).map((key) => {
		return {
			call: participants[key].call,
			stream: participants[key].stream,
			name: participants[key].name,
			id: key,
			role: participants[key].role,
		}
	});
}

const doesParticipantAlreadyExist = (ref, id) => {
	for (const key in ref.current.value) {
		if (id === key) return true;
	}
	return false;
}

export const addParticipant = (ref, updateState, call, stream, id, name, role) => {
	ref.current.value = ref.current.value || {};
	if (!doesParticipantAlreadyExist(ref, id)) {
		ref.current.value[id] = { call, name, stream, role };
	} else {
		ref.current.value[id].stream = stream;
	}
	updateState();
}
export const removeParticipant = (ref, updateState, id) => {
	delete ref.current.value[id];
	updateState();
}