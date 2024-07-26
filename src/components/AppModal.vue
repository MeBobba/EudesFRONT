<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
            <div class="modal-header">
                <h3>{{ title }}</h3>
                <button @click="$emit('close')" class="close-button" :disabled="disableClose">&times;</button>
            </div>
            <div class="modal-body">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AppModal',
    props: {
        title: {
            type: String,
            default: 'Modal Title'
        },
        disableClose: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    animation: fadeIn 0.3s ease-in-out;
}

.modal-container {
    background: white;
    color: black;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 100%;
    margin: 0 15px;
    position: relative;
    animation: slideIn 0.3s ease-out;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
}

.close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #333;
}

.modal-body {
    font-size: 1rem;
    color: #666;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
    .modal-container {
        background: #333;
        color: #f0f0f0;
    }

    .modal-header h3 {
        color: #f0f0f0;
    }

    .close-button {
        color: #f0f0f0;
    }

    .modal-body {
        color: #ccc;
    }
}

/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
