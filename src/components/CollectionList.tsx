import { useState } from 'react';
import type { FormEvent } from 'react';
import { COLLECTION_NAME_MAX, validateCollectionName } from '../hooks/useCollections';
import type { Collection } from '../hooks/useCollections';

/** 'all' = tất cả bài đã lưu, 'none' = chưa phân loại, còn lại là id bộ sưu tập */
export type Selection = string;

interface Props {
    collections: Collection[];
    selected: Selection;
    // số bài mỗi mục
    counts?: Record<string, number>;
    onSelect: (selection: Selection) => void;
    onCreate: (name: string) => string;
    onRename: (id: string, name: string) => string;
    onDelete: (id: string) => void;
}

export default function CollectionList({
                                           collections,
                                           selected,
                                           counts,
                                           onSelect,
                                           onCreate,
                                           onRename,
                                           onDelete,
                                       }: Props) {
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newError, setNewError] = useState('');

    const [renaming, setRenaming] = useState(false);
    const [editName, setEditName] = useState('');
    const [editError, setEditError] = useState('');

    // Bộ sưu tập đang chọn (null khi đang ở "Tất cả" hoặc "Chưa phân loại")
    const current = collections.find((c) => c.id === selected) ?? null;

    const choose = (id: Selection) => {
        setRenaming(false);
        onSelect(id);
    };

    // Tạo mới: kiểm tra ngay khi gõ
    const openCreate = () => {
        setRenaming(false);
        setCreating(true);
        setNewName('');
        setNewError('');
    };

    const handleNewChange = (value: string) => {
        setNewName(value);
        setNewError(value ? validateCollectionName(value, collections) : '');
    };

    const submitNew = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const error = onCreate(newName);
        setNewError(error);
        if (!error) {
            setCreating(false);
            setNewName('');
        }
    };

    // Đổi tên
    const startRename = () => {
        if (!current) return;
        setCreating(false);
        setEditName(current.name);
        setEditError('');
        setRenaming(true);
    };

    const handleEditChange = (value: string) => {
        setEditName(value);
        setEditError(validateCollectionName(value, collections, current?.id));
    };

    const submitRename = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!current) return;
        const error = onRename(current.id, editName);
        if (error) setEditError(error);
        else setRenaming(false);
    };

    // Xóa có xác nhận
    const confirmDelete = () => {
        if (!current) return;
        const ok = window.confirm(
            `Xóa bộ sưu tập "${current.name}"?\nCác bài trong đó sẽ chuyển về "Chưa phân loại".`
        );
        if (!ok) return;
        onDelete(current.id);
        onSelect('all');
    };

    const chipClass = (id: Selection) => `col-chip${selected === id ? ' is-active' : ''}`;

    return (
        <div className="col-bar">
            <div className="col-chips">
                <button type="button" className={chipClass('all')} aria-pressed={selected === 'all'} onClick={() => choose('all')}>
                    Tất cả {counts && <span className="col-count">{counts.all ?? 0}</span>}
                </button>
                <button type="button" className={chipClass('none')} aria-pressed={selected === 'none'} onClick={() => choose('none')}>
                    Chưa phân loại {counts && <span className="col-count">{counts.none ?? 0}</span>}
                </button>
                {collections.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        className={chipClass(c.id)}
                        aria-pressed={selected === c.id}
                        onClick={() => choose(c.id)}
                    >
                        {c.name} {counts && <span className="col-count">{counts[c.id] ?? 0}</span>}
                    </button>
                ))}
                <button type="button" className="col-chip col-chip-add" onClick={openCreate}>
                    + Bộ sưu tập mới
                </button>
            </div>

            {/* Form tạo mới */}
            {creating && (
                <form className="col-form" onSubmit={submitNew} noValidate>
                    <input
                        value={newName}
                        placeholder="Tên bộ sưu tập mới"
                        aria-label="Tên bộ sưu tập mới"
                        aria-invalid={Boolean(newError)}
                        autoFocus
                        onChange={(e) => handleNewChange(e.target.value)}
                    />
                    <button type="button" onClick={() => setCreating(false)}>
                        Hủy
                    </button>
                    <button type="submit" className="is-primary" disabled={!newName.trim() || Boolean(newError)}>
                        Tạo
                    </button>
                    <span className="col-hint">
                        {newName.length}/{COLLECTION_NAME_MAX}
                    </span>
                    {newError && <span className="col-error">{newError}</span>}
                </form>
            )}

            {/* Thanh thao tác, chỉ hiện khi đang chọn một bộ sưu tập thật */}
            {current && !renaming && (
                <div className="col-toolbar">
                    <span>
                        Bộ sưu tập: <strong>{current.name}</strong>
                    </span>
                    <button type="button" onClick={startRename}>
                        Đổi tên
                    </button>
                    <button type="button" className="is-danger" onClick={confirmDelete}>
                        Xóa
                    </button>
                </div>
            )}

            {/* Form đổi tên */}
            {current && renaming && (
                <form className="col-form" onSubmit={submitRename} noValidate>
                    <input
                        value={editName}
                        aria-label="Tên bộ sưu tập"
                        aria-invalid={Boolean(editError)}
                        autoFocus
                        onChange={(e) => handleEditChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setRenaming(false);
                        }}
                    />
                    <button type="button" onClick={() => setRenaming(false)}>
                        Hủy
                    </button>
                    <button type="submit" className="is-primary" disabled={!editName.trim() || Boolean(editError)}>
                        Lưu
                    </button>
                    <span className="col-hint">
                        {editName.length}/{COLLECTION_NAME_MAX}
                    </span>
                    {editError && <span className="col-error">{editError}</span>}
                </form>
            )}
        </div>
    );
}