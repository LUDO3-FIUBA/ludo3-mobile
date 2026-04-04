import moment from 'moment';

type LateSubmissionInfo = {
	isLate: boolean;
	lateByText: string | null;
};

export function getLateSubmissionInfo(submissionDate: string | Date | null | undefined, endDate: string | Date | null | undefined): LateSubmissionInfo {
	if (!submissionDate || !endDate) {
		return {
			isLate: false,
			lateByText: null,
		};
	}

	const isLate = moment(submissionDate).isAfter(moment(endDate));
	if (!isLate) {
		return {
			isLate: false,
			lateByText: null,
		};
	}

	const ms = moment(submissionDate).diff(moment(endDate));
	const minutes = Math.floor(ms / (1000 * 60));
	const days = Math.floor(minutes / (60 * 24));
	const hours = Math.floor((minutes % (60 * 24)) / 60);
	const mins = minutes % 60;

	if (days > 0) {
		return {
			isLate: true,
			lateByText: `${days} día${days > 1 ? 's' : ''} ${hours} hora${hours !== 1 ? 's' : ''} ${mins} minuto${mins !== 1 ? 's' : ''}`,
		};
	}

	return {
		isLate: true,
		lateByText: `${hours} hora${hours !== 1 ? 's' : ''} ${mins} minuto${mins !== 1 ? 's' : ''}`,
	};
}
